// NOTE: Git change detection for the auto-changeset system.
// NOTE: Isolated from changeset generation so git calls can be mocked for testing.

import { execSync } from 'child_process'
import { ROOT } from '../shared/constants.mjs'
import { isSourceFile } from '../shared/file-helpers.mjs'

/**
 * NOTE: Detects changed files in packages/core/src/ via git.
 * Checks staged, unstaged, and untracked files.
 * Returns deduplicated list of core source file paths.
 */
export function getChangedCoreFiles() {
  try {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { cwd: ROOT, encoding: 'utf-8' })
    const unstaged = execSync('git diff --name-only --diff-filter=ACMR', { cwd: ROOT, encoding: 'utf-8' })
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, encoding: 'utf-8' })

    const allFiles = [...staged.split('\n'), ...unstaged.split('\n'), ...untracked.split('\n')]
    return [...new Set(allFiles)]
      .map(f => f.trim())
      .filter(f => f && f.startsWith('packages/core/src/') && isSourceFile(f) && !f.endsWith('.test.ts') && !f.endsWith('.spec.ts'))
  } catch {
    return []
  }
}