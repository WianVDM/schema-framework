#!/usr/bin/env node

/**
 * Auto-Changeset Generator — CLI Entry Point
 *
 * Non-interactive changeset creation for packages/core/src/ modifications.
 * Generates a patch-level changeset file derived from changed file names.
 *
 * Usage:
 *   node scripts/auto-changeset/index.mjs                    # Auto-detect from git
 *   node scripts/auto-changeset/index.mjs --files a.ts b.ts  # Explicit file list
 */

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../shared/constants.mjs'
import { readPackageJson } from '../shared/file-helpers.mjs'
import { generateChangeset, writeChangeset } from './changeset-writer.mjs'
import { getChangedCoreFiles } from './git-operations.mjs'

/**
 * NOTE: Reads the package name from packages/core/package.json.
 * Falls back to '@my-framework/core' if unreadable.
 */
function getCorePackageName() {
  const corePkgPath = join(ROOT, 'packages', 'core', 'package.json')
  const pkg = readPackageJson(corePkgPath)
  return pkg ? pkg.name : '@my-framework/core'
}

/**
 * NOTE: Main entry point. Detects changed files, generates changeset, writes to disk.
 */
function main() {
  const args = process.argv.slice(2)
  let files

  const filesIdx = args.indexOf('--files')
  if (filesIdx !== -1 && args.length > filesIdx + 1) {
    files = args.slice(filesIdx + 1)
  } else {
    files = getChangedCoreFiles()
  }

  if (files.length === 0) {
    console.log('ℹ️  No packages/core/src/ changes detected — no changeset needed.')
    return
  }

  const changesetDir = join(ROOT, '.changeset')
  if (!existsSync(changesetDir)) {
    mkdirSync(changesetDir, { recursive: true })
  }

  // NOTE: Skip if a changeset already exists — manual changeset takes precedence over auto-generated
  const existingChangesets = readdirSync(changesetDir).filter(
    f => f.endsWith('.md') && f !== 'README.md',
  )
  if (existingChangesets.length > 0) {
    console.log(`ℹ️  Changeset already exists (${existingChangesets[0]}). Skipping auto-generation.`)
    return
  }

  const packageName = getCorePackageName()
  const { filename, content } = generateChangeset(files, packageName)
  const filePath = join(changesetDir, filename)

  if (writeChangeset(filePath, content)) {
    console.log(`✅ Auto-generated changeset: .changeset/${filename}`)
    console.log(
      `   ${content
        .split('\n')
        .find(l => l.trim() && !l.startsWith('---') && !l.startsWith('"'))
        ?.trim()}`,
    )
  } else {
    console.error(`❌ Failed to write changeset: ${filePath}`)
    process.exitCode = 1
  }
}

main()
