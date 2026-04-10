#!/usr/bin/env node

/**
 * AI Context Generator
 *
 * Generates the full tiered AI context system:
 * - Tier 1: .context.json per directory (2-space indent, merge mode)
 * - Tier 2: symbol-index-layer{1,2,3}.json, symbol-index-manifest.json,
 *           impact-graph.json, directory-index.json (compressed JSON)
 *
 * Flags:
 *   --force   Regenerate all files regardless of mtime
 *   --check   Compare without writing; exit 1 on drift
 */

import {
  readFileSync, writeFileSync, existsSync, readdirSync,
  statSync, unlinkSync, mkdirSync,
} from 'fs'
import { join, relative, dirname, extname, basename, resolve, posix } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

// --- CLI flags ---
const forceAll = process.argv.includes('--force')
const checkMode = process.argv.includes('--check')

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
  throw new Error(`Unknown layer for directory: ${dirPath}`)
}

// --- Token estimation ---
function estimateTokens(text, isJson = false) {
  return Math.ceil(text.length / (isJson ? 3 : 4))
}

// --- Compressed JSON (no whitespace) ---
function writeCompressedJson(filePath, data) {
  return JSON.stringify(data)
}

// --- Pretty JSON (2-space, for .context.json only) ---
function writePrettyJson(data) {
  return JSON.stringify(data, null, 2) + '\n'
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
  const isBarrel = basename(filePath).startsWith('index.')

  const reExportMatches = [
    ...content.matchAll(/export\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g),
    ...content.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g),
    ...content.matchAll(/export\s+type\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g),
  ]

  if (isBarrel && reExportMatches.length > 0) {
    return [{ name: '*', type: 're-export', desc: 'Barrel re-exports' }]
  }

  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
      exports.push({ name: match[1], keyword: match[0].split(/\s+/)[1] })
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
    while ((match = pattern.exec(content)) !== null) imports.push(match[1])
  }
  return [...new Set(imports)]
}

// --- Resolve import to file path ---
function resolveImport(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    const resolved = resolve(dirname(fromFile), importPath)
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
      if (existsSync(resolved + ext)) return resolved + ext
    }
    return resolved
  }
  return null
}

// --- Directory discovery ---
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
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name))
      } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.gen.ts')) {
        hasSource = true
      }
    }
    if (hasSource) results.push(relative(ROOT, dir).replace(/\\/g, '/'))
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
  const map = { interface: 'interface', type: 'type', class: 'component', function: 'function', const: 'const', enum: 'const' }
  return map[keyword] || 'const'
}

// --- Detect language for directory ---
function detectLanguage(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return 'typescript'
  const files = readdirSync(absDir)
  const hasTsx = files.some(f => f.endsWith('.tsx'))
  const hasTs = files.some(f => f.endsWith('.ts'))
  if (hasTsx) return 'typescript-jsx'
  if (hasTs) return 'typescript'
  return 'typescript'
}

// --- Category inference from directory path ---
function inferCategory(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('/types')) return 'dto'
  if (norm.includes('/renderers')) return 'component'
  if (norm.includes('/validators')) return 'utility'
  if (norm.includes('/primitives')) return 'component'
  if (norm.includes('/helpers')) return 'utility'
  if (norm.includes('/data')) return 'dto'
  if (norm.includes('/routes')) return 'controller'
  if (norm.includes('/server')) return 'service'
  if (norm.includes('/stores')) return 'utility'
  if (norm.includes('/context')) return 'config'
  if (norm.includes('/lib')) return 'utility'
  if (norm.includes('/components')) return 'component'
  return 'other'
}

// --- Load existing .context.json for merge ---
function loadExistingContext(dirPath) {
  const contextPath = join(resolve(ROOT, dirPath), '.context.json')
  if (!existsSync(contextPath)) return null
  try { return JSON.parse(readFileSync(contextPath, 'utf-8')) } catch { return null }
}

// --- Build context for a single directory ---
function buildContextForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return null

  const files = getSourceFiles(absDir)
  if (files.length === 0) return null

  const layer = getLayer(dirPath)
  const language = detectLanguage(dirPath)
  const filesMap = {}
  const rels = {}
  const extDeps = {}
  const symbolTypes = {}
  const existingContext = loadExistingContext(dirPath)

  for (const file of files) {
    const filePath = join(absDir, file)
    const exports = parseExports(filePath)
    const imports = parseImports(filePath)

    for (const exp of exports) {
      if (exp.name && exp.name !== '*') symbolTypes[exp.name] = classifyExport(exp.keyword)
    }

    const existing = existingContext?.files?.[file]

    if (exports.length === 0) {
      filesMap[file] = existing || {
        export: '*', type: 'component',
        desc: `TODO: describe ${basename(file, extname(file))}`,
      }
      // Preserve hand-crafted deprecated and tests
      if (existing?.deprecated !== undefined) filesMap[file].deprecated = existing.deprecated
      if (existing?.tests !== undefined) filesMap[file].tests = existing.tests
    } else if (exports.length === 1 && exports[0].type === 're-export') {
      filesMap[file] = { export: '*', type: 're-export', desc: 'Barrel re-exports' }
    } else if (exports.length === 1) {
      const exp = exports[0]
      filesMap[file] = {
        export: exp.name,
        type: classifyExport(exp.keyword),
        desc: existing?.desc || `TODO: describe ${exp.name}`,
      }
      if (existing?.deprecated !== undefined) filesMap[file].deprecated = existing.deprecated
      if (existing?.tests !== undefined) filesMap[file].tests = existing.tests
    } else {
      const names = exports.map(e => e.name).join(', ')
      const types = [...new Set(exports.map(e => classifyExport(e.keyword)))]
      filesMap[file] = {
        export: names,
        type: types.length === 1 ? types[0] : 'const',
        desc: existing?.desc || `TODO: describe ${names.split(',')[0].trim()} (+${exports.length - 1} more)`,
      }
      if (existing?.deprecated !== undefined) filesMap[file].deprecated = existing.deprecated
      if (existing?.tests !== undefined) filesMap[file].tests = existing.tests
    }

    const internalDeps = []
    const externalDepList = []
    for (const imp of imports) {
      if (imp.startsWith('.')) {
        const resolved = resolveImport(imp, filePath)
        if (resolved) {
          const resolvedDir = dirname(resolved)
          if (resolvedDir === absDir) {
            const depFile = basename(resolved)
            if (depFile !== file && files.includes(depFile)) internalDeps.push(depFile)
          }
        }
      } else {
        externalDepList.push(imp)
      }
    }
    if (internalDeps.length > 0) rels[file] = [...new Set(internalDeps)]
    if (externalDepList.length > 0) extDeps[file] = [...new Set(externalDepList)]
  }

  const schemaRelPath = posix.relative(dirPath, 'docs/ai/schemas/context-schema.json')

  return {
    context: {
      $schema: schemaRelPath,
      layer,
      language,
      purpose: existingContext?.purpose || '',
      files: filesMap,
      ...(Object.keys(rels).length > 0 ? { rels } : {}),
      ...(Object.keys(extDeps).length > 0 ? { extDeps } : {}),
    },
    symbolTypes,
  }
}

// --- Parse per-symbol types for cached dirs ---
function parseSymbolTypesForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return {}
  const files = getSourceFiles(absDir)
  const symbolTypes = {}
  for (const file of files) {
    const exports = parseExports(join(absDir, file))
    for (const exp of exports) {
      if (exp.name && exp.name !== '*') symbolTypes[exp.name] = classifyExport(exp.keyword)
    }
  }
  return symbolTypes
}

// --- Check if context file is fresh ---
function isContextFresh(dirPath) {
  const contextPath = join(resolve(ROOT, dirPath), '.context.json')
  if (!existsSync(contextPath)) return false
  try {
    const contextMtime = statSync(contextPath).mtimeMs
    for (const file of getSourceFiles(resolve(ROOT, dirPath))) {
      if (statSync(join(resolve(ROOT, dirPath), file)).mtimeMs > contextMtime) return false
    }
    return true
  } catch { return false }
}

// --- Token budgets ---
let BUDGETS
try {
  BUDGETS = JSON.parse(readFileSync(join(ROOT, 'docs/ai/token-budgets.json'), 'utf-8')).budgets
} catch (err) {
  console.warn(`⚠️  Failed to load token-budgets.json: ${err.message}`)
  BUDGETS = {
    'system.md': { maxTokens: 800, maxLines: 80 },
    'context.json': { maxTokens: 2500, maxLines: 280 },
    'symbol-index-manifest.json': { maxTokens: 200, maxLines: 20 },
    'symbol-index-layer1.json': { maxTokens: 500, maxLines: 60 },
    'symbol-index-layer2.json': { maxTokens: 5000, maxLines: 450 },
    'symbol-index-layer3.json': { maxTokens: 2000, maxLines: 200 },
  }
}

function validateTokenBudget(filePath, content) {
  let matched = null
  for (const [suffix, budget] of Object.entries(BUDGETS)) {
    if (filePath.endsWith(suffix)) { matched = budget; break }
  }
  if (!matched) return null
  const tokens = estimateTokens(content, true)
  const lines = content.split('\n').length
  const warnings = []
  if (tokens > matched.maxTokens) warnings.push(`Token budget exceeded: ${tokens} > ${matched.maxTokens}`)
  if (lines > matched.maxLines) warnings.push(`Line budget exceeded: ${lines} > ${matched.maxLines}`)
  return warnings.length > 0 ? warnings : null
}

// --- Tier 2 Generators ---

function generateSymbolIndexes(contexts) {
  const layerData = { 1: {}, 2: {}, 3: {} }

  for (const { dirPath, context, symbolTypes } of contexts) {
    for (const [file, meta] of Object.entries(context.files)) {
      if (meta.type === 're-export') continue
      const names = meta.export.split(',').map(n => n.trim())
      for (const name of names) {
        if (name === '*') continue
        const filePath = posix.join(dirPath, file).replace(/\\/g, '/')
        const entry = {
          file: filePath,
          type: symbolTypes?.[name] || meta.type,
          category: inferCategory(dirPath),
        }
        if (!layerData[context.layer][name]) layerData[context.layer][name] = []
        layerData[context.layer][name].push(entry)
      }
    }
  }

  // Build per-layer files (array format)
  const outputs = []
  const layerNames = { 1: 'layer1', 2: 'layer2', 3: 'layer3' }
  const manifestLayers = {}
  let totalSymbols = 0

  for (const [layer, name] of Object.entries(layerNames)) {
    const symbols = layerData[layer]
    const file = `symbol-index-${name}.json`
    const layerObj = {
      $schema: 'schemas/symbol-index-schema.json',
      layer: Number(layer),
      generatedAt: new Date().toISOString(),
      symbols,
    }
    const content = writeCompressedJson(join(ROOT, 'docs', 'ai', file), layerObj)
    const count = Object.keys(symbols).length
    totalSymbols += count
    outputs.push({ file, content, count, tokens: estimateTokens(content, true) })

    manifestLayers[layer] = {
      file,
      symbols: count,
    }
  }

  // Build manifest
  const manifest = {
    $schema: 'schemas/symbol-index-manifest-schema.json',
    generatedAt: new Date().toISOString(),
    totalSymbols,
    layers: manifestLayers,
  }
  const manifestContent = writeCompressedJson(join(ROOT, 'docs', 'ai', 'symbol-index-manifest.json'), manifest)
  outputs.push({ file: 'symbol-index-manifest.json', content: manifestContent, count: totalSymbols, tokens: estimateTokens(manifestContent, true) })

  // Delete old monolithic symbol-index.json if it exists
  const oldPath = join(ROOT, 'docs', 'ai', 'symbol-index.json')
  if (existsSync(oldPath)) {
    if (!checkMode) unlinkSync(oldPath)
    console.log('  🗑️  Removed old docs/ai/symbol-index.json')
  }

  return outputs
}

function generateImpactGraph(contexts) {
  // Map: normalized file path → all files that import it
  const consumedBy = {}

  for (const { dirPath, context } of contexts) {
    if (!context.extDeps) continue
    for (const [file, deps] of Object.entries(context.extDeps)) {
      for (const dep of deps) {
        if (!dep.startsWith('.')) continue
        const fromPath = posix.join(dirPath, file)
        // Normalize the dependency path
        const parts = dep.split('/')
        const resolved = []
        for (const part of parts) {
          if (part === '..') resolved.pop()
          else if (part !== '.') resolved.push(part)
        }
        const normalizedDep = resolved.join('/')
        if (!consumedBy[normalizedDep]) consumedBy[normalizedDep] = []
        if (!consumedBy[normalizedDep].includes(fromPath)) consumedBy[normalizedDep].push(fromPath)
      }
    }
  }

  const data = {
    $schema: 'schemas/impact-graph-schema.json',
    generatedAt: new Date().toISOString(),
    consumedBy,
  }
  return { content: writeCompressedJson(null, data), tokens: estimateTokens(writeCompressedJson(null, data), true), entries: Object.keys(consumedBy).length }
}

function generateDirectoryIndex(contexts) {
  const directories = {}
  for (const { dirPath, context } of contexts) {
    directories[dirPath] = context.purpose || ''
  }
  const data = {
    $schema: 'schemas/directory-index-schema.json',
    generatedAt: new Date().toISOString(),
    directories,
  }
  return { content: writeCompressedJson(null, data), tokens: estimateTokens(writeCompressedJson(null, data), true), count: Object.keys(directories).length }
}

// --- File writing helper ---
function writeTier2File(fileName, content) {
  const filePath = join(ROOT, 'docs', 'ai', fileName)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

// --- Check mode helper ---
function checkFile(fileName, expectedContent) {
  const filePath = join(ROOT, 'docs', 'ai', fileName)
  if (!existsSync(filePath)) {
    console.log(`  ❌ ${fileName} — missing`)
    return false
  }
  const actual = readFileSync(filePath, 'utf-8')
  if (actual !== expectedContent) {
    console.log(`  ❌ ${fileName} — stale`)
    return false
  }
  return true
}

// --- Main ---
function main() {
  if (checkMode) {
    console.log('🔍 Checking AI context freshness...\n')
  } else {
    console.log('🔄 Generating AI context files...\n')
  }

  const allDirs = SCAN_ROOTS.flatMap(root => discoverSourceDirs(root))
  console.log(checkMode ? `  📂 Checking ${allDirs.length} directories\n` : `  📂 Discovered ${allDirs.length} directories with source files\n`)

  const contexts = []
  let regenerated = 0
  let skipped = 0
  let allFresh = true

  for (const dirPath of allDirs) {
    if (!forceAll && !checkMode && isContextFresh(dirPath)) {
      const existing = loadExistingContext(dirPath)
      if (existing) {
        contexts.push({ dirPath, context: existing, symbolTypes: parseSymbolTypesForDir(dirPath) })
        skipped++
      }
      continue
    }

    if (checkMode) {
      // In check mode, verify context exists and is fresh
      if (!isContextFresh(dirPath)) {
        console.log(`  ❌ ${dirPath}/.context.json — stale or missing`)
        allFresh = false
      }
      const existing = loadExistingContext(dirPath)
      if (existing) contexts.push({ dirPath, context: existing, symbolTypes: parseSymbolTypesForDir(dirPath) })
      continue
    }

    const result = buildContextForDir(dirPath)
    if (!result) continue

    const { context, symbolTypes } = result
    const content = writePrettyJson(context)
    const outPath = join(resolve(ROOT, dirPath), '.context.json')
    writeFileSync(outPath, content, 'utf-8')

    const tokenEst = estimateTokens(content, true)
    console.log(`  ✅ ${dirPath}/.context.json (${tokenEst} tokens)`)
    const warnings = validateTokenBudget(outPath, content)
    if (warnings) for (const w of warnings) console.log(`     ⚠️  ${w}`)

    contexts.push({ dirPath, context, symbolTypes })
    regenerated++
  }

  if (skipped > 0 && !checkMode) console.log(`  ⏭️  ${skipped} directories skipped (context fresh)\n`)

  // Generate Tier 2 files
  const symbolOutputs = generateSymbolIndexes(contexts)
  const impactOutput = generateImpactGraph(contexts)
  const dirIndexOutput = generateDirectoryIndex(contexts)

  if (checkMode) {
    // Check symbol index files
    for (const { file, content } of symbolOutputs) {
      if (!checkFile(file, content)) allFresh = false
    }
    if (!checkFile('impact-graph.json', impactOutput.content)) allFresh = false
    if (!checkFile('directory-index.json', dirIndexOutput.content)) allFresh = false

    if (allFresh) {
      console.log(`\n✅ All AI context files are fresh.`)
    } else {
      console.log(`\n❌ Some AI context files are stale. Run pnpm generate-context to update.`)
      process.exit(1)
    }
    return
  }

  // Write symbol index files
  for (const { file, content, count, tokens } of symbolOutputs) {
    writeTier2File(file, content)
    const label = `docs/ai/${file}`
    console.log(`  ✅ ${label} (${tokens} tokens, ${count} symbols)`)
    const warnings = validateTokenBudget(label, content)
    if (warnings) for (const w of warnings) console.log(`     ⚠️  ${w}`)
  }

  // Write impact graph
  writeTier2File('impact-graph.json', impactOutput.content)
  console.log(`  ✅ docs/ai/impact-graph.json (${impactOutput.tokens} tokens, ${impactOutput.entries} entries)`)

  // Write directory index
  writeTier2File('directory-index.json', dirIndexOutput.content)
  console.log(`  ✅ docs/ai/directory-index.json (${dirIndexOutput.tokens} tokens, ${dirIndexOutput.count} directories)`)

  console.log(`\n✨ AI context generation complete! (${regenerated} regenerated, ${skipped} skipped)`)
}

main()