#!/usr/bin/env node

/**
 * AI Context Generator
 * Auto-generates .context.json files and symbol-index.json from TypeScript source.
 * Zero external dependencies — uses only Node.js built-ins (fs, path, url).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync, mkdirSync } from 'fs'
import { join, relative, dirname, extname, basename, resolve, posix } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// --- Root directories to scan recursively (relative to ROOT) ---
const SCAN_ROOTS = [
  'packages/core/src/primitives',
  'packages/core/src/engine',
  'apps/showcase/src',
]

// --- Layer mapping ---
function getLayer(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('packages/core/src/primitives')) return 1
  if (norm.includes('packages/core/src/engine')) return 2
  if (norm.includes('apps/showcase')) return 3
  throw new Error(`Unknown layer for directory: ${dirPath}. Expected path containing packages/core/src/primitives, packages/core/src/engine, or apps/showcase.`)
}

// --- Token estimation ---
function estimateTokens(text, isJson = false) {
  return Math.ceil(text.length / (isJson ? 3 : 4))
}

// --- Export parsing ---
const EXPORT_PATTERNS = [
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)/g,
  /export\s+class\s+(\w+)/g,
  /export\s+function\s+(\w+)/g,
  /export\s+enum\s+(\w+)/g,
  /export\s+const\s+(\w+)/g,
]

function parseExports(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const exports = []

  // Check if it's a barrel file (index.ts)
  const isBarrel = basename(filePath).startsWith('index.')

  // Detect re-exports
  const reExportMatches = [
    ...content.matchAll(/export\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g),
    ...content.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g),
    ...content.matchAll(/export\s+type\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g),
  ]

  if (isBarrel && reExportMatches.length > 0) {
    return [{ name: '*', type: 're-export', desc: 'Barrel re-exports' }]
  }

  // Parse named exports
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1]
      const keyword = match[0].split(/\s+/)[1] // interface, type, class, function, const, enum
      exports.push({ name, keyword })
    }
  }

  return exports
}

// --- Import parsing ---
function parseImports(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const imports = []

  const patterns = [
    /import\s+(?:type\s+)?(?:(?:\{[^}]*\}|[\w]+|\*\s+as\s+\w+))\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1])
    }
  }

  return [...new Set(imports)]
}

// --- Resolve import to file path ---
function resolveImport(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    const dir = dirname(fromFile)
    const resolved = resolve(dir, importPath)
    // Try extensions
    for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
      if (existsSync(resolved + ext)) return resolved + ext
    }
    return resolved
  }
  return null // External package
}

// --- Recursively discover directories containing source files ---
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.turbo'])

function discoverSourceDirs(rootPath) {
  const results = []
  const absRoot = resolve(ROOT, rootPath)
  if (!existsSync(absRoot)) return results

  function walk(dir) {
    let hasSource = false
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(join(dir, entry.name))
        }
      } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.gen.ts')) {
        hasSource = true
      }
    }

    if (hasSource) {
      results.push(relative(ROOT, dir).replace(/\\/g, '/'))
    }
  }

  walk(absRoot)
  return results.sort()
}

// --- Get TS/TSX files in directory ---
function getSourceFiles(dirPath) {
  if (!existsSync(dirPath)) return []
  return readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile() && /\.(ts|tsx)$/.test(d.name) && !d.name.endsWith('.d.ts') && !d.name.endsWith('.gen.ts'))
    .map(d => d.name)
    .sort()
}

// --- Classify export type ---
function classifyExport(keyword) {
  const map = {
    'interface': 'interface',
    'type': 'type',
    'class': 'component',
    'function': 'function',
    'const': 'const',
    'enum': 'const',
  }
  return map[keyword] || 'const'
}

// --- Build context for a single directory ---
function buildContextForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return null

  const files = getSourceFiles(absDir)
  if (files.length === 0) return null

  const layer = getLayer(dirPath)
  const filesMap = {}
  const rels = {}
  const extDeps = {}
  const symbolTypes = {}

  // Load existing .context.json for merge (preserve hand-crafted descriptions)
  const contextPath = join(absDir, '.context.json')
  let existingContext = null
  if (existsSync(contextPath)) {
    try {
      existingContext = JSON.parse(readFileSync(contextPath, 'utf-8'))
    } catch { /* ignore parse errors */ }
  }

  for (const file of files) {
    const filePath = join(absDir, file)
    const exports = parseExports(filePath)
    const imports = parseImports(filePath)

    // NOTE: Track per-symbol types so the symbol index uses each export's
    // actual AST kind (function, interface, const, etc.) rather than the
    // collapsed file-level type assigned to multi-export .context.json entries.
    for (const exp of exports) {
      if (exp.name && exp.name !== '*') {
        symbolTypes[exp.name] = classifyExport(exp.keyword)
      }
    }

    // Build file entry
    if (exports.length === 0) {
      // No exports detected — might be a route or default export
      const existing = existingContext?.files?.[file]
      filesMap[file] = existing || {
        export: '*',
        type: 'component',
        desc: `TODO: describe ${basename(file, extname(file))}`,
      }
    } else if (exports.length === 1 && exports[0].type === 're-export') {
      filesMap[file] = { export: '*', type: 're-export', desc: 'Barrel re-exports' }
    } else if (exports.length === 1) {
      const exp = exports[0]
      // Preserve existing description if available
      const existing = existingContext?.files?.[file]
      filesMap[file] = {
        export: exp.name,
        type: classifyExport(exp.keyword),
        desc: existing?.desc || `TODO: describe ${exp.name}`,
      }
    } else {
      // Multi-export file
      const existing = existingContext?.files?.[file]
      const names = exports.map(e => e.name).join(', ')
      const types = [...new Set(exports.map(e => classifyExport(e.keyword)))]
      filesMap[file] = {
        export: names,
        type: types.length === 1 ? types[0] : 'const',
        desc: existing?.desc || `TODO: describe ${names.split(',')[0].trim()} (+${exports.length - 1} more)`,
      }
    }

    // Resolve imports to internal/external
    const internalDeps = []
    const externalDepList = []

    for (const imp of imports) {
      if (imp.startsWith('.')) {
        const resolved = resolveImport(imp, filePath)
        if (resolved) {
          const resolvedDir = dirname(resolved)
          if (resolvedDir === absDir) {
            // Internal dependency (same directory)
            const depFile = basename(resolved)
            if (depFile !== file && files.includes(depFile)) {
              internalDeps.push(depFile)
            }
          }
        }
      } else {
        externalDepList.push(imp)
      }
    }

    if (internalDeps.length > 0) {
      rels[file] = [...new Set(internalDeps)]
    }
    if (externalDepList.length > 0) {
      extDeps[file] = [...new Set(externalDepList)]
    }
  }

  // Determine purpose from existing or generate
  const purpose = existingContext?.purpose || ''

  // Compute relative path from this .context.json to docs/ai/schemas/context-schema.json
  const schemaRelPath = posix.relative(
    dirPath,
    'docs/ai/schemas/context-schema.json'
  )

  return {
    context: {
      $schema: schemaRelPath,
      layer,
      purpose,
      files: filesMap,
      ...(Object.keys(rels).length > 0 ? { rels } : {}),
      ...(Object.keys(extDeps).length > 0 ? { extDeps } : {}),
    },
    symbolTypes,
  }
}

// --- Parse per-symbol types for a directory (used for cached contexts) ---
function parseSymbolTypesForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return {}

  const files = getSourceFiles(absDir)
  const symbolTypes = {}

  for (const file of files) {
    const filePath = join(absDir, file)
    const exports = parseExports(filePath)
    for (const exp of exports) {
      if (exp.name && exp.name !== '*') {
        symbolTypes[exp.name] = classifyExport(exp.keyword)
      }
    }
  }

  return symbolTypes
}

// --- Build symbol index from all context files ---
function buildSymbolIndex(contexts) {
  const symbols = {}

  for (const { dirPath, context, symbolTypes } of contexts) {
    for (const [file, meta] of Object.entries(context.files)) {
      if (meta.type === 're-export') continue

      const names = meta.export.split(',').map(n => n.trim())
      for (const name of names) {
        if (name === '*') continue
        const filePath = posix.join(dirPath, file).replace(/\\/g, '/')
        if (symbols[name]) {
          // NOTE: Duplicate exports are expected for route files (all export `Route` from createFileRoute).
          // Re-exports are already skipped above (line 281), so they never reach this block.
          if (name === 'Route') {
            continue
          }
          throw new Error(
            `Duplicate export "${name}" found in both ${symbols[name].file} and ${filePath}`
          )
        }
        // NOTE: Use per-symbol type when available (accurate for multi-export files
        // where individual exports have different AST kinds, e.g. function vs const).
        symbols[name] = {
          file: filePath,
          type: symbolTypes?.[name] || meta.type,
          layer: context.layer,
        }
      }
    }
  }

  return {
    $schema: 'schemas/symbol-index-schema.json',
    symbols,
  }
}

// --- Check if context file is fresh (mtime newer than all source files) ---
function isContextFresh(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const contextPath = join(absDir, '.context.json')
  if (!existsSync(contextPath)) return false

  try {
    const contextMtime = statSync(contextPath).mtimeMs
    const files = getSourceFiles(absDir)
    for (const file of files) {
      const filePath = join(absDir, file)
      if (statSync(filePath).mtimeMs > contextMtime) {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

// --- Load existing context for symbol index (skipped dirs) ---
function loadExistingContext(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const contextPath = join(absDir, '.context.json')
  if (!existsSync(contextPath)) return null
  try {
    return JSON.parse(readFileSync(contextPath, 'utf-8'))
  } catch {
    return null
  }
}

// --- Write context file ---
function writeContextFile(dirPath, data) {
  const absDir = resolve(ROOT, dirPath)
  const contextPath = join(absDir, '.context.json')
  const content = JSON.stringify(data, null, 2) + '\n'
  writeFileSync(contextPath, content, 'utf-8')
  return { path: contextPath, content }
}

// --- Token budgets (loaded from docs/ai/token-budgets.json) ---
let BUDGETS
try {
  const budgetsRaw = readFileSync(join(ROOT, 'docs/ai/token-budgets.json'), 'utf-8')
  BUDGETS = JSON.parse(budgetsRaw).budgets
} catch (err) {
  console.warn(
    `⚠️  Failed to load docs/ai/token-budgets.json: ${err.message}. Using fallback values.`
  )
  BUDGETS = {
    'system.md': { maxTokens: 800, maxLines: 80 },
    'context.json': { maxTokens: 2500, maxLines: 280 },
    'symbol-index.json': { maxTokens: 7000, maxLines: 700 },
    'symbol-index-layer1.json': { maxTokens: 500, maxLines: 60 },
    'symbol-index-layer2.json': { maxTokens: 5000, maxLines: 450 },
    'symbol-index-layer3.json': { maxTokens: 2000, maxLines: 200 },
    'file-placement.json': { maxTokens: 300, maxLines: 40 },
  }
}

// --- Validate token budget ---
function validateTokenBudget(filePath, content) {
  let matched = null
  for (const [suffix, budget] of Object.entries(BUDGETS)) {
    if (filePath.endsWith(suffix)) {
      matched = budget
      break
    }
  }

  if (!matched) return null

  const tokens = estimateTokens(content, true)
  const lines = content.split('\n').length
  const warnings = []

  if (tokens > matched.maxTokens) {
    warnings.push(`Token budget exceeded: ${tokens} > ${matched.maxTokens}`)
  }
  if (lines > matched.maxLines) {
    warnings.push(`Line budget exceeded: ${lines} > ${matched.maxLines}`)
  }

  return warnings.length > 0 ? warnings : null
}

// --- Parse CLI flags ---
const forceAll = process.argv.includes('--force')

// --- Main ---
function main() {
  console.log('🔄 Generating AI context files...\n')

  // Discover all source directories recursively from SCAN_ROOTS
  const allDirs = SCAN_ROOTS.flatMap(root => discoverSourceDirs(root))
  console.log(`  📂 Discovered ${allDirs.length} directories with source files\n`)

  const contexts = []
  let regenerated = 0
  let skipped = 0

  for (const dirPath of allDirs) {
    // NOTE: Incremental mode — skip directories where .context.json is fresher than all source files.
    // Use --force flag to regenerate all contexts regardless of mtime.
    if (!forceAll && isContextFresh(dirPath)) {
      const existing = loadExistingContext(dirPath)
      if (existing) {
        const symbolTypes = parseSymbolTypesForDir(dirPath)
        contexts.push({ dirPath, context: existing, symbolTypes })
        skipped++
      }
      continue
    }

    const result = buildContextForDir(dirPath)
    if (!result) {
      console.log(`  ⏭️  ${dirPath} — no source files found, skipping`)
      continue
    }

    const { context, symbolTypes } = result
    const { path: outPath, content } = writeContextFile(dirPath, context)
    const warnings = validateTokenBudget(outPath, content)
    const tokenEst = estimateTokens(content, true)

    console.log(`  ✅ ${dirPath}/.context.json (${tokenEst} tokens)`)
    if (warnings) {
      for (const w of warnings) console.log(`     ⚠️  ${w}`)
    }

    contexts.push({ dirPath, context, symbolTypes })
    regenerated++
  }

  if (skipped > 0) {
    console.log(`  ⏭️  ${skipped} directories skipped (context fresh)\n`)
  }

  // Generate symbol index (always regenerated from all contexts)
  const symbolIndex = buildSymbolIndex(contexts)
  const symbolIndexPath = join(ROOT, 'docs', 'ai', 'symbol-index.json')
  const symbolContent = JSON.stringify(symbolIndex, null, 2) + '\n'
  mkdirSync(dirname(symbolIndexPath), { recursive: true })
  writeFileSync(symbolIndexPath, symbolContent, 'utf-8')

  const symbolTokens = estimateTokens(symbolContent, true)
  console.log(`  ✅ docs/ai/symbol-index.json (${symbolTokens} tokens, ${Object.keys(symbolIndex.symbols).length} symbols)`)

  const warnings = validateTokenBudget(symbolIndexPath, symbolContent)
  if (warnings) {
    for (const w of warnings) console.log(`     ⚠️  ${w}`)
  }

  // Generate layer-specific symbol indices for smaller AI context loads
  const layerNames = { 1: 'layer1', 2: 'layer2', 3: 'layer3' }
  for (const [layer, name] of Object.entries(layerNames)) {
    const layerSymbols = Object.fromEntries(
      Object.entries(symbolIndex.symbols).filter(([, v]) => v.layer === Number(layer))
    )
    const layerIndex = {
      $schema: 'schemas/symbol-index-schema.json',
      symbols: layerSymbols,
    }
    const layerPath = join(ROOT, 'docs', 'ai', `symbol-index-${name}.json`)
    const layerContent = JSON.stringify(layerIndex, null, 2) + '\n'
    writeFileSync(layerPath, layerContent, 'utf-8')

    const layerTokens = estimateTokens(layerContent, true)
    console.log(`  ✅ docs/ai/symbol-index-${name}.json (${layerTokens} tokens, ${Object.keys(layerSymbols).length} symbols)`)
    const layerWarnings = validateTokenBudget(layerPath, layerContent)
    if (layerWarnings) {
      for (const w of layerWarnings) console.log(`     ⚠️  ${w}`)
    }
  }

  console.log(`\n✨ AI context generation complete! (${regenerated} regenerated, ${skipped} skipped)`)
}

main()