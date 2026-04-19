// NOTE: Biome runner — single-file and full-project biome execution.
// NOTE: Provides checkSingleFile() and checkProject() for hook consumption.

import { execSync } from 'node:child_process'

/**
 * NOTE: Runs biome check --fix on a single file to auto-fix formatting/import sorting.
 * Used by PostToolUse hook before validation to prevent formatting-only blocks.
 * @param {string} filePath - Absolute path to the file to fix
 * @returns {boolean} Whether the fix succeeded without remaining errors
 */
export function autoFixSingleFile(filePath) {
  try {
    execSync(`npx biome check --fix "${filePath}" --no-errors-on-unmatched`, {
      encoding: 'utf-8',
      windowsHide: true,
      timeout: 15_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return true
  } catch {
    // NOTE: --fix may not resolve all errors — remaining ones caught by checkSingleFile
    return false
  }
}

/**
 * NOTE: Runs biome check on a single file and returns violations.
 * Used by PostToolUse hook for per-file validation.
 * @param {string} filePath - Absolute path to the file to check
 * @returns {{ passed: boolean, errors: string[] }}
 */
export function checkSingleFile(filePath) {
  try {
    execSync(`npx biome check "${filePath}" --no-errors-on-unmatched`, {
      encoding: 'utf-8',
      windowsHide: true,
      timeout: 15_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { passed: true, errors: [] }
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`
    const errors = parseBiomeErrors(output)
    return { passed: errors.length === 0, errors }
  }
}

/**
 * NOTE: Runs biome check --write on the entire project to auto-fix formatting/import sorting.
 * Used by TaskComplete hook before compliance checks to prevent formatting-only blocks.
 * @param {string} workspaceRoot - Absolute path to the workspace root
 * @returns {{ fixed: number, success: boolean }}
 */
export function autoFixProject(workspaceRoot) {
  try {
    const output = execSync('npx biome check --write .', {
      encoding: 'utf-8',
      windowsHide: true,
      timeout: 60_000,
      cwd: workspaceRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    const fixedMatch = output.match(/Fixed (\d+) files?/)
    const fixed = fixedMatch ? Number.parseInt(fixedMatch[1], 10) : 0
    return { fixed, success: true }
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`
    const fixedMatch = output.match(/Fixed (\d+) files?/)
    const fixed = fixedMatch ? Number.parseInt(fixedMatch[1], 10) : 0
    return { fixed, success: false }
  }
}

/**
 * NOTE: Runs full-project biome check and returns violations.
 * Used by TaskComplete hook for full codebase validation.
 * @returns {{ passed: boolean, errors: string[], warnings: string[] }}
 */
export function checkProject() {
  try {
    execSync('npx biome check .', {
      encoding: 'utf-8',
      windowsHide: true,
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { passed: true, errors: [], warnings: [] }
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}`
    const errors = parseBiomeErrors(output)
    const warnings = parseBiomeWarnings(output)
    return { passed: errors.length === 0, errors, warnings }
  }
}

/**
 * NOTE: Parses biome output to extract error messages.
 * Biome errors have the format: file:line:col category/rule  FIXABLE  ━━  × message
 */
function parseBiomeErrors(output) {
  const errors = []
  const lines = output.split('\n')
  let currentFile = ''

  for (const line of lines) {
    // NOTE: Match file path lines (e.g., "src/file.ts:1:1 lint/...")
    const fileMatch = line.match(/^([^\s:]+:\d+:\d+)\s+(.+?)$/)
    if (fileMatch) {
      currentFile = fileMatch[1]
    }

    // NOTE: Match error lines (× prefix)
    const errorMatch = line.match(/^\s*×\s+(.+)$/)
    if (errorMatch) {
      errors.push(currentFile ? `${currentFile}: ${errorMatch[1].trim()}` : errorMatch[1].trim())
    }
  }

  return errors
}

/**
 * NOTE: Parses biome output to extract warning-level messages.
 * Currently treats all non-error findings as informational.
 */
function parseBiomeWarnings(output) {
  const warnings = []
  const lines = output.split('\n')

  for (const line of lines) {
    const warnMatch = line.match(/^\s*!\s+(.+)$/)
    if (warnMatch) {
      warnings.push(warnMatch[1].trim())
    }
  }

  return warnings
}
