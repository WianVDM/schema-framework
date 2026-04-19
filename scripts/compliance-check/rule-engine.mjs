// NOTE: Rule engine — loads v2 workspace rules and runs checks against file content.
// NOTE: Handles scope matching, extension matching, regex checking, and suppression comments.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { SCAN_ROOTS, SKIP_DIRS } from '../shared/constants.mjs'
import { isSourceFile } from '../shared/file-helpers.mjs'

/** @typedef {{ id: string, scope: string, fileMatch: string[], pattern: string, message: string, rationale: string }} RuleCheck */
/** @typedef {{ id: string, file: string, line: number, message: string, rationale: string }} Violation */

const cachedRulesByRoot = new Map()

/**
 * NOTE: Loads all RuleCheck objects from .clinerules/workspace-*.json files.
 * Caches result per workspaceRoot (rules don't change during a hook invocation).
 * @param {string} workspaceRoot - Project root directory
 * @returns {RuleCheck[]}
 */
export function loadRules(workspaceRoot) {
  if (cachedRulesByRoot.has(workspaceRoot)) return cachedRulesByRoot.get(workspaceRoot)

  const rulesDir = join(workspaceRoot, '.clinerules')
  if (!existsSync(rulesDir)) {
    cachedRulesByRoot.set(workspaceRoot, [])
    return cachedRulesByRoot.get(workspaceRoot)
  }

  const allChecks = []
  const jsonFiles = readdirSync(rulesDir).filter(
    f => f.startsWith('workspace-') && f.endsWith('.json'),
  )

  for (const file of jsonFiles) {
    try {
      const content = readFileSync(join(rulesDir, file), 'utf-8')
      const parsed = JSON.parse(content)

      // NOTE: Only process v2 schema files with a checks array
      if (parsed.version === 2 && Array.isArray(parsed.checks)) {
        allChecks.push(...parsed.checks)
      }
    } catch (err) {
      // NOTE: Skip malformed rule files — log for operator visibility
      console.warn(
        `[rule-engine] Skipping malformed rule file ${file} in ${rulesDir}: ${err.message}`,
      )
    }
  }

  cachedRulesByRoot.set(workspaceRoot, allChecks)
  return allChecks
}

/**
 * NOTE: Checks a single file's content against all applicable rules.
 * Filters rules by scope and fileMatch, then runs line-by-line pattern matching.
 * Respects suppression comments on the violating line or the line above.
 * @param {string} filePath - Relative file path from workspace root
 * @param {string} content - File content as string
 * @param {RuleCheck[]} rules - All loaded rules
 * @returns {Violation[]}
 */
export function checkFile(filePath, content, rules) {
  const normalizedPath = filePath.replace(/\\/g, '/')
  const applicableRules = rules.filter(
    rule =>
      matchesScope(normalizedPath, rule.scope) &&
      matchesFileExtension(normalizedPath, rule.fileMatch),
  )

  if (applicableRules.length === 0) return []

  const lines = content.split('\n')
  const violations = []

  // NOTE: Precompile regex patterns once per rule with error handling
  const compiledRules = []
  for (const rule of applicableRules) {
    try {
      compiledRules.push({ rule, regex: new RegExp(rule.pattern) })
    } catch {
      // NOTE: Skip rules with invalid regex patterns — don't crash the engine
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prevLine = i > 0 ? lines[i - 1] : ''

    for (const { rule, regex } of compiledRules) {
      if (regex.test(line)) {
        if (hasSuppression(line, prevLine, rule.id)) continue
        violations.push({
          id: rule.id,
          file: filePath,
          line: i + 1,
          message: rule.message,
          rationale: rule.rationale,
        })
      }
    }
  }

  return violations
}

/**
 * NOTE: Checks all source files in the project against all applicable rules.
 * Walks SCAN_ROOTS directories, reads each source file, delegates to checkFile.
 * @param {string} workspaceRoot - Project root directory
 * @param {RuleCheck[]} rules - All loaded rules
 * @returns {Violation[]}
 */
export function checkProject(workspaceRoot, rules) {
  if (rules.length === 0) return []

  const allViolations = []
  const skipDirs = new Set(SKIP_DIRS)

  for (const scanRoot of SCAN_ROOTS) {
    const absRoot = resolve(workspaceRoot, scanRoot)
    if (!existsSync(absRoot)) continue
    walkAndCheck(absRoot, workspaceRoot, rules, skipDirs, allViolations)
  }

  return allViolations
}

/**
 * NOTE: Recursively walks a directory, checking each source file against rules.
 */
function walkAndCheck(dirPath, workspaceRoot, rules, skipDirs, violations) {
  const entries = readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) {
        walkAndCheck(join(dirPath, entry.name), workspaceRoot, rules, skipDirs, violations)
      }
      continue
    }

    if (!(entry.isFile() && isSourceFile(entry.name))) continue

    const filePath = join(dirPath, entry.name)
    const relPath = relative(workspaceRoot, filePath).replace(/\\/g, '/')

    try {
      const content = readFileSync(filePath, 'utf-8')
      const fileViolations = checkFile(relPath, content, rules)
      violations.push(...fileViolations)
    } catch {
      // NOTE: Skip files we can't read (binary, locked, etc.)
    }
  }
}

/**
 * NOTE: Checks if a file path matches a glob-like scope pattern.
 * Normalizes path separators and handles ** wildcards.
 * @param {string} filePath - Normalized file path (forward slashes)
 * @param {string} scope - Glob-like scope pattern (e.g., "packages/core/src/**")
 * @returns {boolean}
 */
function matchesScope(filePath, scope) {
  if (!scope || scope === '**') return true

  const normalized = filePath.replace(/\\/g, '/')
  const scopePattern = scope.replace(/\\/g, '/')

  // NOTE: Convert glob to regex — ** → match any path segment, * → match any chars
  const regexStr = scopePattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{GLOBSTAR}}/g, '.*')

  // NOTE: Match anywhere in path, anchored to directory boundary
  const regex = new RegExp(`(^|/)${regexStr}(?:/|$)`)
  return regex.test(normalized)
}

/**
 * NOTE: Checks if a file's extension matches the fileMatch array.
 * @param {string} filePath - File path with extension
 * @param {string[]} fileMatch - Array of extensions without dots (e.g., ["ts", "tsx"])
 * @returns {boolean}
 */
function matchesFileExtension(filePath, fileMatch) {
  if (!fileMatch || fileMatch.length === 0) return true

  const dotIndex = filePath.lastIndexOf('.')
  if (dotIndex === -1) return false

  const ext = filePath.substring(dotIndex + 1)
  return fileMatch.includes(ext)
}

/**
 * NOTE: Checks if a suppression comment exists for a given check ID.
 * Looks at the current line and the line above it.
 * Format: // compliance-ignore <check-id>: NOTE: <reason>
 * @param {string} line - The current line content
 * @param {string} prevLine - The previous line content
 * @param {string} checkId - The check ID to look for
 * @returns {boolean}
 */
function hasSuppression(line, prevLine, checkId) {
  const pattern = `compliance-ignore\\s+${escapeRegex(checkId)}\\s*:`
  const regex = new RegExp(pattern)
  return regex.test(line) || regex.test(prevLine)
}

/**
 * NOTE: Escapes special regex characters in a string.
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
