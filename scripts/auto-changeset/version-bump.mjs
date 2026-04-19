// NOTE: Version bump level resolver for the auto-changeset system.
// NOTE: Derives the correct semver bump level (patch/minor/major) from VERSION_STATUS.md,
// NOTE: ensuring changeset files always produce the intended release version.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../shared/constants.mjs'
import { logTrace } from '../shared/output-helpers.mjs'

const SCRIPT = 'version-bump'

const STATUS_PATH = join(ROOT, 'docs', 'VERSION_STATUS.md')
const CORE_PKG_PATH = join(ROOT, 'packages', 'core', 'package.json')

/** @typedef {'patch' | 'minor' | 'major'} BumpLevel */

/**
 * NOTE: Parses a semver string into [major, minor, patch] numbers.
 * @param {string} version - Semver string like "0.3.2"
 * @returns {[number, number, number] | null}
 */
function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/**
 * NOTE: Computes the semver bump level needed to go from `current` to `target`.
 * Returns 'major' if major differs, 'minor' if minor differs, 'patch' if only patch differs.
 * @param {string} current - Current version (e.g., "0.3.2")
 * @param {string} target - Target version (e.g., "0.3.3")
 * @returns {BumpLevel}
 */
function computeBumpLevel(current, target) {
  const currentParts = parseSemver(current)
  const targetParts = parseSemver(target)

  if (!(currentParts && targetParts)) {
    logTrace(SCRIPT, `[WARN] Could not parse versions: current=${current}, target=${target}`)
    return 'patch'
  }

  if (targetParts[0] !== currentParts[0]) return 'major'
  if (targetParts[1] !== currentParts[1]) return 'minor'
  return 'patch'
}

/**
 * NOTE: Reads the current and target versions from VERSION_STATUS.md.
 * Falls back to reading current from packages/core/package.json if VERSION_STATUS.md
 * doesn't have a target version entry.
 * @returns {{ current: string, target: string, bump: BumpLevel } | null}
 */
export function resolveBumpLevel() {
  let content
  try {
    content = readFileSync(STATUS_PATH, 'utf-8')
  } catch {
    logTrace(SCRIPT, `[WARN] VERSION_STATUS.md not found at ${STATUS_PATH}`)
    return null
  }

  const currentMatch = content.match(/##\s*Current Version:\s*(\S+)/)
  const targetMatch = content.match(/##\s*Target Version:\s*(\S+)/)

  if (!(currentMatch && targetMatch)) {
    logTrace(SCRIPT, '[WARN] Could not parse Current/Target Version from VERSION_STATUS.md')
    return null
  }

  const current = currentMatch[1]
  const target = targetMatch[1]
  const bump = computeBumpLevel(current, target)

  logTrace(SCRIPT, `[RESULT] current=${current}, target=${target}, bump=${bump}`)
  return { current, target, bump }
}

/**
 * NOTE: Validates that an existing changeset file's bump level matches the expected
 * bump level derived from VERSION_STATUS.md. Returns null if valid, or an error message.
 * @param {string} changesetContent - Full content of the changeset .md file
 * @param {BumpLevel} expectedBump - Expected bump level
 * @returns {string | null} Error message if mismatch, null if valid
 */
export function validateChangesetBump(changesetContent, expectedBump) {
  // NOTE: Extract bump level from changeset frontmatter — looks for "packageName": bump
  const bumpMatch = changesetContent.match(/"@\S+":\s*(patch|minor|major)/)
  if (!bumpMatch) {
    return 'Could not parse bump level from changeset frontmatter'
  }

  const actualBump = bumpMatch[1]

  // NOTE: Bump hierarchy: major > minor > patch. The actual bump is valid if it's <= expected.
  // For example, if VERSION_STATUS says patch (0.3.1→0.3.2), a minor bump would produce 0.4.0 — wrong.
  const hierarchy = { patch: 0, minor: 1, major: 2 }
  const actualRank = hierarchy[actualBump]
  const expectedRank = hierarchy[expectedBump]

  if (actualRank > expectedRank) {
    return (
      `Changeset bump level "${actualBump}" exceeds expected "${expectedBump}" from VERSION_STATUS.md. ` +
      'This would produce an incorrect release version. ' +
      `Change the changeset frontmatter to "${expectedBump}" to match the target version.`
    )
  }

  return null
}

/**
 * NOTE: Reads the current version from packages/core/package.json.
 * @returns {string | null}
 */
export function readCoreVersion() {
  try {
    const raw = readFileSync(CORE_PKG_PATH, 'utf-8')
    const pkg = JSON.parse(raw)
    return pkg.version || null
  } catch {
    return null
  }
}
