// NOTE: Validates that pending changeset bump levels align with VERSION_STATUS.md.
// NOTE: Prevents incorrect release versions (e.g., minor bump producing 0.4.0 instead of 0.3.2).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolveBumpLevel, validateChangesetBump } from '../../auto-changeset/version-bump.mjs'
import { ROOT } from '../../shared/constants.mjs'

/**
 * NOTE: Validates all pending changeset files have bump levels consistent with
 * VERSION_STATUS.md target version. Reports violations when a changeset would
 * produce a higher version than intended.
 */
export function checkChangesetBumps(collector) {
  const versionInfo = resolveBumpLevel()
  if (!versionInfo) {
    // NOTE: VERSION_STATUS.md may not exist or be parseable — skip gracefully
    return
  }

  const changesetDir = join(ROOT, '.changeset')
  if (!existsSync(changesetDir)) return

  const changesetFiles = readdirSync(changesetDir).filter(
    f => f.endsWith('.md') && f !== 'README.md',
  )

  for (const file of changesetFiles) {
    const content = readFileSync(join(changesetDir, file), 'utf-8')
    const error = validateChangesetBump(content, versionInfo.bump)
    if (error) {
      collector.addViolation(
        `Changeset "${file}" has incorrect bump level. ${error} ` +
          `(VERSION_STATUS.md: current=${versionInfo.current}, target=${versionInfo.target}, expected bump=${versionInfo.bump})`,
      )
    }
  }
}
