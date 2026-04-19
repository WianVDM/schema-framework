// NOTE: Context governance validation — checks .context.json governance fields.
// NOTE: Validates: governance presence, TODO/FIXME markers, pattern conflicts.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { ROOT, SCAN_ROOTS, SKIP_DIRS } from '../../shared/constants.mjs'

/**
 * NOTE: Validates governance fields in all .context.json files across scan roots.
 * Checks: governance presence (warn), TODO/FIXME markers (error), pattern conflicts (warn).
 */
export function checkContextGovernance(collector) {
  for (const root of SCAN_ROOTS) {
    const absRoot = resolve(ROOT, root)
    if (!existsSync(absRoot)) continue
    checkGovernanceRecursive(absRoot, collector)
  }
}

/**
 * NOTE: Recursively walks directories checking .context.json governance validity.
 * Delegates per-file validation to validateGovernance().
 */
function checkGovernanceRecursive(dirPath, collector) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const skipDirs = new Set(SKIP_DIRS)

  const contextFile = entries.find(e => e.name === '.context.json')
  if (contextFile) {
    const contextPath = join(dirPath, '.context.json')
    validateGovernance(contextPath, collector)
  }

  // NOTE: Recurse into subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !skipDirs.has(entry.name)) {
      checkGovernanceRecursive(join(dirPath, entry.name), collector)
    }
  }
}

/**
 * NOTE: Validates governance fields in a single .context.json file.
 * Checks: governance presence, TODO/FIXME markers, pattern conflicts.
 */
function validateGovernance(contextPath, collector) {
  const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')

  let context
  try {
    const raw = readFileSync(contextPath, 'utf-8')
    context = JSON.parse(raw)
  } catch (err) {
    collector.addWarning(`Failed to parse ${relPath}: ${err.message}`)
    return
  }

  // NOTE: Check 1 — governance presence
  if (!context.governance || typeof context.governance !== 'object') {
    collector.addWarning(
      `Governance missing: ${relPath} — run pnpm generate-context --force to add`,
    )
    return
  }

  const gov = context.governance
  checkGovernanceMarkers(gov, context.layer, relPath, collector)
  checkGovernanceConflicts(gov, relPath, collector)
}

/**
 * NOTE: Checks for TODO/FIXME markers in governance array fields.
 * These markers indicate fields that need manual specification.
 */
function checkGovernanceMarkers(gov, layer, relPath, collector) {
  const arrayFields = ['importsFrom', 'importedBy', 'constraints', 'forbidden']
  for (const field of arrayFields) {
    const value = gov[field]
    if (!Array.isArray(value)) continue

    for (const item of value) {
      if (typeof item === 'string' && (item.startsWith('TODO:') || item.startsWith('FIXME:'))) {
        collector.addViolation(
          `Governance unresolved: ${relPath} → governance.${field} contains "${item}"`,
        )
      }
    }
  }

  // NOTE: Suggest restricting imports if importsFrom is empty (skip composition layer — intentional unrestricted)
  if (Array.isArray(gov.importsFrom) && gov.importsFrom.length === 0 && layer !== 3) {
    collector.addSuggestion(
      `Governance opportunity: ${relPath} → importsFrom is empty — consider restricting allowed imports`,
    )
  }
}

/**
 * NOTE: Checks for conflicts between importsFrom and forbidden patterns.
 * A pattern conflict occurs when the same base path appears in both arrays.
 */
function checkGovernanceConflicts(gov, relPath, collector) {
  if (!(Array.isArray(gov.forbidden) && Array.isArray(gov.importsFrom))) return

  const conflicts = findPatternConflicts(gov.importsFrom, gov.forbidden)
  for (const conflict of conflicts) {
    collector.addWarning(
      `Governance conflict: ${relPath} → "${conflict}" appears in both importsFrom and forbidden`,
    )
  }
}

/**
 * NOTE: Finds patterns that appear in both importsFrom and forbidden arrays.
 * Uses prefix matching — a forbidden pattern is a conflict if it shares
 * a base path with an importsFrom pattern.
 */
function findPatternConflicts(importsFrom, forbidden) {
  const conflicts = []
  for (const imp of importsFrom) {
    if (typeof imp !== 'string') continue
    const impBase = imp.replace(/\/?\*+$/, '')
    for (const fbd of forbidden) {
      if (typeof fbd !== 'string') continue
      const fbdBase = fbd.replace(/\/?\*+$/, '')
      // NOTE: Segment-boundary matching — require '/' separator for prefix matches
      if (
        impBase === fbdBase ||
        impBase.startsWith(`${fbdBase}/`) ||
        fbdBase.startsWith(`${impBase}/`)
      ) {
        conflicts.push(imp)
      }
    }
  }
  return conflicts
}
