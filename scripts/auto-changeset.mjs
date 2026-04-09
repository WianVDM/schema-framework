#!/usr/bin/env node

/**
 * Auto-Changeset Generator
 * Non-interactive changeset creation for packages/core/src/ modifications.
 * Generates a patch-level changeset file derived from changed file names.
 *
 * Usage:
 *   node scripts/auto-changeset.mjs                    # Auto-detect from git
 *   node scripts/auto-changeset.mjs --files a.ts b.ts  # Explicit file list
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// --- Read package name from packages/core/package.json ---
function getCorePackageName() {
  const corePkgPath = join(ROOT, 'packages', 'core', 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(corePkgPath, 'utf-8'))
    return pkg.name
  } catch {
    return '@my-framework/core'
  }
}

// --- Get changed files from git ---
function getChangedCoreFiles() {
  try {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { cwd: ROOT, encoding: 'utf-8' })
    const unstaged = execSync('git diff --name-only --diff-filter=ACMR', { cwd: ROOT, encoding: 'utf-8' })
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, encoding: 'utf-8' })

    const allFiles = [...staged.split('\n'), ...unstaged.split('\n'), ...untracked.split('\n')]
    return [...new Set(allFiles)]
      .map(f => f.trim())
      .filter(f => f && f.startsWith('packages/core/src/') && /\.(ts|tsx)$/.test(f) && !f.endsWith('.d.ts') && !f.endsWith('.test.ts') && !f.endsWith('.spec.ts'))
  } catch {
    return []
  }
}

// --- Generate changeset content ---
function generateChangeset(files, packageName) {
  // Derive a short description from changed file names
  const summaries = files.map(f => {
    const parts = f.replace('packages/core/src/', '').split('/')
    return parts[parts.length - 1].replace(/\.(ts|tsx)$/, '')
  })

  const uniqueSummaries = [...new Set(summaries)]
  const description = uniqueSummaries.length <= 3
    ? `Update ${uniqueSummaries.join(', ')}`
    : `Update ${uniqueSummaries.slice(0, 3).join(', ')} and ${uniqueSummaries.length - 3} more`

  // Generate unique ID from file names + timestamp
  const hash = createHash('md5')
    .update(files.join(',') + Date.now())
    .digest('hex')
    .slice(0, 8)

  const frontmatter = `---\n"${packageName}": patch\n---\n`
  const body = `${description}\n`

  return { filename: `auto-${hash}.md`, content: frontmatter + body }
}

// --- Main ---
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

  // Check if a changeset already exists (skip if so)
  const existingChangesets = readdirSync(changesetDir).filter(f => f.endsWith('.md') && f !== 'README.md')
  if (existingChangesets.length > 0) {
    console.log(`ℹ️  Changeset already exists (${existingChangesets[0]}). Skipping auto-generation.`)
    return
  }

  const packageName = getCorePackageName()
  const { filename, content } = generateChangeset(files, packageName)
  const filePath = join(changesetDir, filename)
  writeFileSync(filePath, content, 'utf-8')

  console.log(`✅ Auto-generated changeset: .changeset/${filename}`)
  console.log(`   ${content.split('\n').find(l => l.trim() && !l.startsWith('---') && !l.startsWith('"'))?.trim()}`)
}

main()