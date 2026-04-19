// NOTE: Git change detection for the auto-changeset system.
// NOTE: Isolated from changeset generation so git calls can be mocked for testing.

import { execFileSync, execSync, spawnSync } from 'node:child_process'
import { ROOT } from '../shared/constants.mjs'
import { isSourceFile } from '../shared/file-helpers.mjs'
import { logTrace } from '../shared/output-helpers.mjs'

const SCRIPT = 'auto-changeset'

/**
 * NOTE: Detects changed files in packages/core/src/ via git.
 * Checks staged, unstaged, and untracked files.
 * Returns deduplicated list of core source file paths.
 */
export function getChangedCoreFiles() {
  logTrace(SCRIPT, '[STEP] Detecting changed files via git')
  try {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    const unstaged = execSync('git diff --name-only --diff-filter=ACMR', {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    const untracked = execSync('git ls-files --others --exclude-standard', {
      cwd: ROOT,
      encoding: 'utf-8',
    })

    const allFiles = [...staged.split('\n'), ...unstaged.split('\n'), ...untracked.split('\n')]
    const coreFiles = [...new Set(allFiles)]
      .map(f => f.trim())
      .filter(
        f =>
          f?.startsWith('packages/core/src/') &&
          isSourceFile(f) &&
          !f.endsWith('.test.ts') &&
          !f.endsWith('.spec.ts'),
      )

    logTrace(
      SCRIPT,
      `[STEP] Raw git files: ${allFiles.filter(f => f.trim()).length}, core source: ${coreFiles.length}`,
    )
    return coreFiles
  } catch {
    logTrace(SCRIPT, '[ERROR] Git detection failed — returning empty list')
    return []
  }
}

/**
 * NOTE: Gets the unified diff for a specific file.
 * Returns the raw diff string or empty string on failure.
 */
export function getFileDiff(filePath) {
  try {
    const diff = execFileSync('git', ['diff', '--unified=3', '--', filePath], {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    // NOTE: execFileSync returns empty string for untracked files — use fallback
    if (diff.trim()) {
      logTrace(SCRIPT, `[STEP] Diff retrieved for ${filePath} (${diff.length} chars)`)
      return diff
    }
    logTrace(SCRIPT, `[STEP] Empty diff for ${filePath}, trying untracked fallback`)
  } catch {
    logTrace(SCRIPT, `[STEP] diff failed for ${filePath}, trying untracked fallback`)
  }

  {
    // NOTE: File may be untracked — diff against platform-aware null device
    // NOTE: spawnSync handles exit code 1 (differences found) without throwing
    const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null'
    const result = spawnSync(
      'git',
      ['diff', '--unified=3', '--no-index', nullDevice, '--', filePath],
      {
        cwd: ROOT,
        encoding: 'utf-8',
      },
    )
    if (result.status === 0 || result.status === 1) {
      const diff = result.stdout ?? ''
      logTrace(
        SCRIPT,
        `[STEP] Untracked file diff retrieved for ${filePath} (${diff.length} chars)`,
      )
      return diff
    }
    logTrace(SCRIPT, `[STEP] No diff available for ${filePath}`)
    return ''
  }
}
