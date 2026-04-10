// NOTE: VERSION_STATUS.md consistency validation.
// NOTE: Checks version fields match package.json files and milestone status is consistent.

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ROOT } from '../shared/constants.mjs'
import { readPackageJson } from '../shared/file-helpers.mjs'

/**
 * NOTE: Validates version consistency between VERSION_STATUS.md and package.json files.
 * Checks: current version match, target version logic, milestone status, upcoming duplicates.
 */
export function checkVersionStatus(collector) {
  const statusPath = join(ROOT, 'docs', 'VERSION_STATUS.md')
  if (!existsSync(statusPath)) {
    collector.addViolation('docs/VERSION_STATUS.md not found')
    return
  }

  const content = readFileSync(statusPath, 'utf-8')

  const currentVersionMatch = content.match(/##\s*Current Version:\s*(\S+)/)
  const targetVersionMatch = content.match(/##\s*Target Version:\s*(\S+)/)

  if (!currentVersionMatch) {
    collector.addWarning('VERSION_STATUS.md: Could not parse "Current Version" field')
    return
  }

  if (!targetVersionMatch) {
    collector.addWarning('VERSION_STATUS.md: Could not parse "Target Version" field')
    return
  }

  const statedCurrent = currentVersionMatch[1]
  const statedTarget = targetVersionMatch[1]

  const corePkg = readPackageJson(join(ROOT, 'packages', 'core', 'package.json'))
  const showcasePkg = readPackageJson(join(ROOT, 'apps', 'showcase', 'package.json'))

  if (corePkg && corePkg.version !== statedCurrent) {
    collector.addViolation(`VERSION_STATUS.md says "Current Version: ${statedCurrent}" but @my-framework/core is ${corePkg.version}`)
  }

  // NOTE: Showcase version is expected to drift from core — it's an internal demo app.
  // Only warn if showcase is significantly behind (major version gap).
  if (showcasePkg) {
    const coreMajor = statedCurrent.split('.').map(Number)
    const showcaseMajor = showcasePkg.version.split('.').map(Number)
    if (coreMajor[0] > showcaseMajor[0]) {
      collector.addWarning(`VERSION_STATUS.md says "Current Version: ${statedCurrent}" but showcase app is ${showcasePkg.version} (major version behind)`)
    }
  }

  // NOTE: Check milestone status consistency
  const milestoneStatusMatch = content.match(/##\s*Milestone Status:\s*(.+?)$/m)
  if (milestoneStatusMatch) {
    const status = milestoneStatusMatch[1].trim()
    if (status === 'COMPLETE') {
      if (statedCurrent !== statedTarget) {
        collector.addViolation(`VERSION_STATUS.md says milestone COMPLETE but Current Version (${statedCurrent}) ≠ Target Version (${statedTarget})`)
      }
    }
  }

  // NOTE: Check for stale upcoming milestones listing the active milestone
  const upcomingSection = content.match(/##\s*Upcoming Milestones\s*\n([\s\S]*?)(?=\n##|\n$|$)/)
  if (upcomingSection) {
    const activeMilestoneMatch = content.match(/##\s*Active Milestone:\s*(.+)$/m)
    if (activeMilestoneMatch) {
      const activeName = activeMilestoneMatch[1].trim()
      if (upcomingSection[1].includes(activeName)) {
        collector.addWarning(`VERSION_STATUS.md: Active milestone "${activeName}" also appears in "Upcoming Milestones" — should be removed from upcoming`)
      }
    }
  }

  // NOTE: Check that active milestone has unchecked items (unless complete)
  const milestoneStatus = milestoneStatusMatch ? milestoneStatusMatch[1].trim() : ''
  if (milestoneStatus === 'IN PROGRESS') {
    const activeMilestoneMatch = content.match(/##\s*Active Milestone:\s*(.+)$/m)
    if (activeMilestoneMatch) {
      const activeName = activeMilestoneMatch[1].trim()
      const blockRegex = new RegExp(
        `##\\s*Milestone Checklist[^\\n]*${activeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |\\n##[^#]|$)`
      )
      const activeBlock = content.match(blockRegex)
      if (activeBlock) {
        const uncheckedItems = activeBlock[1].match(/- \[ \]/g)
        if (!uncheckedItems) {
          collector.addWarning('VERSION_STATUS.md: Milestone is IN PROGRESS but all checklist items are checked — should be marked COMPLETE')
        }
      }
    }
  }
}