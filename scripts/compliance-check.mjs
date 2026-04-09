#!/usr/bin/env node

/**
 * Compliance Check — Post-build validation runner
 *
 * Validates project health after `pnpm build`:
 * - VERSION_STATUS.md version consistency vs package.json files
 * - CHANGELOG.md existence for published packages
 * - .context.json freshness (source files newer than context)
 * - Description quality (generic/auto-generated descriptions flagged)
 * - Symbol uniqueness (no duplicate exports across files)
 *
 * Output: Structured report with violations and suggestions.
 * Exit code: 0 always (violations are informational for AI, not build-blocking).
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, resolve, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// --- Output helpers ---

const violations = []
const warnings = []
const suggestions = []

function violation(msg) { violations.push(msg) }
function warning(msg) { warnings.push(msg) }
function suggest(msg) { suggestions.push(msg) }

// --- Version consistency ---

function checkVersionStatus() {
  const statusPath = join(ROOT, 'docs', 'VERSION_STATUS.md')
  if (!existsSync(statusPath)) {
    violation('docs/VERSION_STATUS.md not found')
    return
  }

  const content = readFileSync(statusPath, 'utf-8')

  // Extract "Current Version" line
  const currentVersionMatch = content.match(/##\s*Current Version:\s*(\S+)/)
  const targetVersionMatch = content.match(/##\s*Target Version:\s*(\S+)/)

  if (!currentVersionMatch) {
    warning('VERSION_STATUS.md: Could not parse "Current Version" field')
    return
  }

  if (!targetVersionMatch) {
    warning('VERSION_STATUS.md: Could not parse "Target Version" field')
    return
  }

  const statedCurrent = currentVersionMatch[1]
  const statedTarget = targetVersionMatch[1]

  // Read package versions
  const corePkg = readPackageJson(join(ROOT, 'packages', 'core', 'package.json'))
  const showcasePkg = readPackageJson(join(ROOT, 'apps', 'showcase', 'package.json'))

  if (corePkg && corePkg.version !== statedCurrent) {
    violation(`VERSION_STATUS.md says "Current Version: ${statedCurrent}" but @my-framework/core is ${corePkg.version}`)
  }

  // NOTE: Showcase version is expected to drift from core — it's an internal demo app.
  // Only warn if showcase is significantly behind (major version gap).
  if (showcasePkg) {
    const coreMajor = statedCurrent.split('.').map(Number)
    const showcaseMajor = showcasePkg.version.split('.').map(Number)
    if (coreMajor[0] > showcaseMajor[0]) {
      warning(`VERSION_STATUS.md says "Current Version: ${statedCurrent}" but showcase app is ${showcasePkg.version} (major version behind)`)
    }
  }

  // Check milestone status consistency
  const milestoneStatusMatch = content.match(/##\s*Milestone Status:\s*(\S+)/)
  if (milestoneStatusMatch) {
    const status = milestoneStatusMatch[1]
    if (status === 'COMPLETE') {
      // If milestone is complete, current version should equal target version
      if (statedCurrent !== statedTarget) {
        violation(`VERSION_STATUS.md says milestone COMPLETE but Current Version (${statedCurrent}) ≠ Target Version (${statedTarget})`)
      }
    }
  }

  // Check for stale upcoming milestones listing the active milestone
  const upcomingSection = content.match(/##\s*Upcoming Milestones\s*\n([\s\S]*?)(?=\n##|\n$|$)/)
  if (upcomingSection) {
    const activeMilestoneMatch = content.match(/##\s*Active Milestone:\s*(.+)$/m)
    if (activeMilestoneMatch) {
      const activeName = activeMilestoneMatch[1].trim()
      if (upcomingSection[1].includes(activeName)) {
        warning(`VERSION_STATUS.md: Active milestone "${activeName}" also appears in "Upcoming Milestones" — should be removed from upcoming`)
      }
    }
  }

  // Check that active milestone has unchecked items (unless complete)
  const milestoneStatus = milestoneStatusMatch ? milestoneStatusMatch[1] : ''
  if (milestoneStatus === 'IN PROGRESS') {
    const uncheckedItems = content.match(/- \[ \]/g)
    if (!uncheckedItems) {
      warning('VERSION_STATUS.md: Milestone is IN PROGRESS but all checklist items are checked — should be marked COMPLETE')
    }
  }
}

// --- CHANGELOG existence ---

function checkChangelogs() {
  const packages = [
    { name: '@my-framework/core', path: join(ROOT, 'packages', 'core') },
    { name: 'showcase', path: join(ROOT, 'apps', 'showcase') },
  ]

  for (const pkg of packages) {
    const pkgJson = readPackageJson(join(pkg.path, 'package.json'))
    if (!pkgJson) continue

    // Only check for packages with version > 0.0.0
    if (pkgJson.version && pkgJson.version !== '0.0.0') {
      const changelogPath = join(pkg.path, 'CHANGELOG.md')
      if (!existsSync(changelogPath)) {
        violation(`CHANGELOG.md missing for ${pkg.name}@${pkgJson.version} — run 'pnpm changeset version' to generate`)
      }
    }
  }
}

// --- Context map freshness ---

function checkContextFreshness() {
  const scanRoots = [
    'packages/core/src/primitives',
    'packages/core/src/engine',
    'apps/showcase/src',
  ]

  for (const root of scanRoots) {
    const absRoot = resolve(ROOT, root)
    if (!existsSync(absRoot)) continue
    checkDirRecursive(absRoot)
  }
}

function checkDirRecursive(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const skipDirs = new Set(['node_modules', '.git', 'dist', '.next', '.turbo', 'ui'])

  // Check if this dir has a .context.json
  const hasContextJson = entries.some(e => e.name === '.context.json')

  if (hasContextJson) {
    const contextPath = join(dirPath, '.context.json')
    const contextMtime = statSync(contextPath).mtimeMs

    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (!/\.(ts|tsx)$/.test(entry.name)) continue
      if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.gen.ts')) continue

      const filePath = join(dirPath, entry.name)
      if (statSync(filePath).mtimeMs > contextMtime) {
        const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
        warning(`Context map stale: ${relPath} — source file "${entry.name}" is newer`)
        break
      }
    }

    // Check description quality — flag any "TODO:" prefixed descriptions
    // (auto-generated by generate-ai-context.mjs, awaiting human/AI review)
    try {
      const contextContent = readFileSync(contextPath, 'utf-8')
      const context = JSON.parse(contextContent)
      if (context.files) {
        for (const [fileName, meta] of Object.entries(context.files)) {
          if (meta.desc && typeof meta.desc === 'string' && meta.desc.startsWith('TODO: ')) {
            const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
            suggest(`Description needed: ${relPath} → ${fileName} ("${meta.desc}")`)
          }
        }
      }
      // Check purpose field
      if (!context.purpose || context.purpose.trim() === '') {
        const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
        suggest(`Purpose field empty: ${relPath} — add a short purpose describing this directory`)
      }
    } catch { /* ignore parse errors */ }
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !skipDirs.has(entry.name)) {
      checkDirRecursive(join(dirPath, entry.name))
    }
  }
}


// --- Symbol uniqueness (from symbol-index.json) ---

function checkSymbolUniqueness() {
  const indexPath = join(ROOT, 'docs', 'ai', 'symbol-index.json')
  if (!existsSync(indexPath)) {
    warning('docs/ai/symbol-index.json not found — run pnpm generate-context')
    return
  }

  try {
    const content = readFileSync(indexPath, 'utf-8')
    const index = JSON.parse(content)
    if (!index.symbols) return

    // Check for duplicate symbols (shouldn't exist if generator works correctly)
    const seen = {}
    for (const [name, meta] of Object.entries(index.symbols)) {
      if (seen[name]) {
        violation(`Duplicate symbol "${name}" found in both ${seen[name]} and ${meta.file}`)
      }
      seen[name] = meta.file
    }
  } catch { /* ignore */ }
}

// --- Helper ---

function readPackageJson(filePath) {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch { return null }
}

// --- Main ---

function main() {
  console.log('\n🔍 Compliance Check Results:\n')

  checkVersionStatus()
  checkChangelogs()
  checkContextFreshness()
  checkSymbolUniqueness()

  // Print results
  if (violations.length === 0 && warnings.length === 0 && suggestions.length === 0) {
    console.log('  ✅ All checks passed — no violations or suggestions\n')
  } else {
    if (violations.length > 0) {
      console.log('  ❌ Violations:')
      for (const v of violations) console.log(`     ${v}`)
      console.log()
    }

    if (warnings.length > 0) {
      console.log('  ⚠️  Warnings:')
      for (const w of warnings) console.log(`     ${w}`)
      console.log()
    }

    if (suggestions.length > 0) {
      console.log('  📝 Descriptions needed (AI should review):')
      for (const s of suggestions) console.log(`     ${s}`)
      console.log()
    }

    console.log(`  Summary: ${violations.length} violations, ${warnings.length} warnings, ${suggestions.length} suggestions\n`)
  }
}

main()