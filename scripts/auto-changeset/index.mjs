#!/usr/bin/env node

// NOTE: Auto-Changeset Generator — CLI Entry Point
// NOTE: Non-interactive changeset creation for packages/core/src/ modifications.
// NOTE: Generates a changeset file with bump level derived from VERSION_STATUS.md.
// NOTE: All trace output goes to stderr; only the final result goes to stdout.

import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../shared/constants.mjs'
import { readPackageJson } from '../shared/file-helpers.mjs'
import { logTrace } from '../shared/output-helpers.mjs'
import { generateChangeset, writeChangeset } from './changeset-writer.mjs'
import { getChangedCoreFiles, getFileDiff } from './git-operations.mjs'
import { resolveBumpLevel, validateChangesetBump } from './version-bump.mjs'

const SCRIPT = 'auto-changeset'

/**
 * NOTE: Reads the package name from packages/core/package.json.
 * Falls back to '@my-framework/core' if unreadable.
 */
function getCorePackageName() {
  const corePkgPath = join(ROOT, 'packages', 'core', 'package.json')
  const pkg = readPackageJson(corePkgPath)
  const name = pkg ? pkg.name : '@my-framework/core'
  logTrace(SCRIPT, `[STEP] Package name resolved: ${name}`)
  return name
}

/**
 * NOTE: Main entry point. Detects changed files, generates changeset, writes to disk.
 */
function main() {
  logTrace(SCRIPT, '[START] Auto-changeset generator invoked')

  const args = process.argv.slice(2)
  let files

  const filesIdx = args.indexOf('--files')
  if (filesIdx !== -1 && args.length > filesIdx + 1) {
    files = args.slice(filesIdx + 1)
    logTrace(SCRIPT, `[STEP] Using explicit file list: ${files.join(', ')}`)
  } else {
    files = getChangedCoreFiles()
    logTrace(SCRIPT, `[STEP] Git-detected changed files: ${files.length}`)
  }

  if (files.length === 0) {
    logTrace(SCRIPT, '[DECISION] No packages/core/src/ changes detected — no changeset needed')
    console.error(
      '[auto-changeset] ℹ️  No packages/core/src/ changes detected — no changeset needed.',
    )
    return
  }

  const changesetDir = join(ROOT, '.changeset')
  if (!existsSync(changesetDir)) {
    mkdirSync(changesetDir, { recursive: true })
    logTrace(SCRIPT, '[STEP] Created .changeset/ directory')
  }

  // NOTE: Resolve bump level from VERSION_STATUS.md to ensure correct release version
  const versionInfo = resolveBumpLevel()
  const bump = versionInfo?.bump ?? 'patch'
  if (versionInfo) {
    logTrace(
      SCRIPT,
      `[STEP] VERSION_STATUS.md: current=${versionInfo.current}, target=${versionInfo.target}, bump=${bump}`,
    )
  } else {
    logTrace(SCRIPT, '[WARN] Could not resolve bump level — defaulting to patch')
  }

  // NOTE: Skip if a changeset already exists — validate its bump level against VERSION_STATUS.md
  const existingChangesets = readdirSync(changesetDir).filter(
    f => f.endsWith('.md') && f !== 'README.md',
  )
  if (existingChangesets.length > 0) {
    logTrace(SCRIPT, `[DECISION] Changeset already exists (${existingChangesets[0]}) — validating`)
    // NOTE: Validate existing changeset bump level matches expected bump from VERSION_STATUS.md
    if (versionInfo) {
      const existingContent = readFileSync(join(changesetDir, existingChangesets[0]), 'utf-8')
      const validationError = validateChangesetBump(existingContent, bump)
      if (validationError) {
        console.error(`[auto-changeset] ⚠️  WARNING: ${validationError}`)
        logTrace(SCRIPT, `[WARN] Bump mismatch in ${existingChangesets[0]}: ${validationError}`)
      }
    }
    return
  }

  const packageName = getCorePackageName()
  logTrace(SCRIPT, `[STEP] Generating changeset for ${files.length} file(s) with bump=${bump}`)
  const { filename, content } = generateChangeset(files, packageName, { getFileDiff }, { bump })
  const filePath = join(changesetDir, filename)

  if (writeChangeset(filePath, content)) {
    logTrace(SCRIPT, `[RESULT] Changeset written: .changeset/${filename}`)
    console.log(`[auto-changeset] ✅ Auto-generated changeset: .changeset/${filename}`)
    const matched = content
      .split('\n')
      .find(l => l.trim() && !l.startsWith('---') && !l.startsWith('"'))
    console.log(`   ${matched?.trim() ?? '(empty changeset)'}`)
  } else {
    logTrace(SCRIPT, `[ERROR] Failed to write changeset: ${filePath}`)
    console.error(`[auto-changeset] ❌ Failed to write changeset: ${filePath}`)
    process.exitCode = 1
  }

  logTrace(SCRIPT, '[DONE] Auto-changeset generator finished')
}

main()
