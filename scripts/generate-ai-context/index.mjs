#!/usr/bin/env node

/**
 * AI Context Generator — Main Entry Point
 *
 * Generates the full tiered AI context system:
 * - Tier 1: .context.json per directory (pretty-printed, merge mode)
 * - Tier 2: symbol-index-layer{1,2,3}.json, symbol-index-manifest.json,
 *           impact-graph.json, directory-index.json (compressed JSON)
 * - docs/context-map.md (auto-generated Mermaid diagrams)
 *
 * Flags:
 *   --force     Regenerate all files regardless of mtime
 *   --check     Compare without writing; exit 1 on drift
 *   --verbose   Show detailed progress output
 *
 * Usage:
 *   node scripts/generate-ai-context/index.mjs
 *   node scripts/generate-ai-context/index.mjs --force
 *   node scripts/generate-ai-context/index.mjs --check --verbose
 */

import { options, SCAN_ROOTS } from './constants.mjs'
import { discoverAllDirs, isContextFresh, loadExistingContext } from './file-discovery.mjs'
import { buildContextForDir, parseSymbolTypesForDir } from './context-builder.mjs'
import { generateSymbolIndexes, generateImpactGraph, generateDirectoryIndex } from './tier2-generator.mjs'
import { generateContextMap } from './context-map-generator.mjs'
import { serializePretty, writeTier2File, writeContextFile, checkFileFreshness } from './io-helpers.mjs'
import { estimateTokens, loadBudgets, validateTokenBudget } from './token-budget.mjs'

// --- Parse CLI flags into shared options ---
options.force = process.argv.includes('--force')
options.check = process.argv.includes('--check')
options.verbose = process.argv.includes('--verbose')

/**
 * NOTE: Main entry point. Delegates to check or generate mode.
 */
function main() {
  if (options.check) {
    console.log('🔍 Checking AI context freshness...\n')
  } else {
    console.log('🔄 Generating AI context files...\n')
  }

  const budgets = loadBudgets()
  const allDirs = discoverAllDirs(SCAN_ROOTS)
  console.log(options.check
    ? `  📂 Checking ${allDirs.length} directories\n`
    : `  📂 Discovered ${allDirs.length} directories with source files\n`
  )

  if (options.check) {
    runCheckMode(allDirs, budgets)
  } else {
    runGenerateMode(allDirs, budgets)
  }
}

/**
 * NOTE: Check mode — verifies all context files are fresh without writing.
 * Collects existing contexts for Tier 2 comparison, then exits 1 on drift.
 */
function runCheckMode(allDirs, budgets) {
  const contexts = []
  let allFresh = true

  for (const dirPath of allDirs) {
    if (!isContextFresh(dirPath)) {
      console.log(`  ❌ ${dirPath}/.context.json — stale or missing`)
      allFresh = false
    }
    const existing = loadExistingContext(dirPath)
    if (existing) {
      contexts.push({ dirPath, context: existing, symbolTypes: parseSymbolTypesForDir(dirPath) })
    }
  }

  // NOTE: Check Tier 2 files against expected content
  const symbolOutputs = generateSymbolIndexes(contexts)
  const impactOutput = generateImpactGraph(contexts)
  const dirIndexOutput = generateDirectoryIndex(contexts)

  for (const { file, content } of symbolOutputs) {
    if (!checkFileFreshness(file, content)) allFresh = false
  }
  if (!checkFileFreshness('impact-graph.json', impactOutput.content)) allFresh = false
  if (!checkFileFreshness('directory-index.json', dirIndexOutput.content)) allFresh = false

  if (allFresh) {
    console.log('\n✅ All AI context files are fresh.')
  } else {
    console.log('\n❌ Some AI context files are stale. Run pnpm generate-context to update.')
    process.exit(1)
  }
}

/**
 * NOTE: Generate mode — builds and writes all context files.
 * Skips fresh directories unless --force is set.
 */
function runGenerateMode(allDirs, budgets) {
  const contexts = []
  let regenerated = 0
  let skipped = 0

  // NOTE: Step 1 — Build or load Tier 1 contexts
  for (const dirPath of allDirs) {
    if (!options.force && isContextFresh(dirPath)) {
      const existing = loadExistingContext(dirPath)
      if (existing) {
        contexts.push({ dirPath, context: existing, symbolTypes: parseSymbolTypesForDir(dirPath) })
        skipped++
      }
      continue
    }

    const result = buildContextForDir(dirPath)
    if (!result) continue

    const { context, symbolTypes } = result
    const content = serializePretty(context)
    const outPath = writeContextFile(dirPath, content)

    const tokenEst = estimateTokens(content, true)
    console.log(`  ✅ ${dirPath}/.context.json (${tokenEst} tokens)`)
    const warnings = validateTokenBudget(outPath, content, budgets)
    if (warnings) for (const w of warnings) console.log(`     ⚠️  ${w}`)

    contexts.push({ dirPath, context, symbolTypes })
    regenerated++
  }

  if (skipped > 0) {
    console.log(`  ⏭️  ${skipped} directories skipped (context fresh)\n`)
  }

  // NOTE: Step 2 — Generate and write Tier 2 files
  const symbolOutputs = generateSymbolIndexes(contexts)
  const impactOutput = generateImpactGraph(contexts)
  const dirIndexOutput = generateDirectoryIndex(contexts)

  for (const { file, content, count, tokens } of symbolOutputs) {
    writeTier2File(file, content)
    const label = `docs/ai/${file}`
    console.log(`  ✅ ${label} (${tokens} tokens, ${count} symbols)`)
    const warnings = validateTokenBudget(label, content, budgets)
    if (warnings) for (const w of warnings) console.log(`     ⚠️  ${w}`)
  }

  writeTier2File('impact-graph.json', impactOutput.content)
  console.log(`  ✅ docs/ai/impact-graph.json (${impactOutput.tokens} tokens, ${impactOutput.entries} entries)`)

  writeTier2File('directory-index.json', dirIndexOutput.content)
  console.log(`  ✅ docs/ai/directory-index.json (${dirIndexOutput.tokens} tokens, ${dirIndexOutput.count} directories)`)

  // NOTE: Step 3 — Auto-generate docs/context-map.md
  const mapResult = generateContextMap(contexts)
  console.log(`  ✅ ${mapResult.path} (${mapResult.tokens} tokens)`)

  console.log(`\n✨ AI context generation complete! (${regenerated} regenerated, ${skipped} skipped)`)
}

main()