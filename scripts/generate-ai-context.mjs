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

// --- Directories to scan (relative to ROOT) ---
const SCAN_DIRS = [
  'packages/core/src/primitives',
  'packages/core/src/engine',
  'packages/core/src/engine/types',
  'packages/core/src/engine/validators',
  'packages/core/src/engine/helpers',
  'packages/core/src/engine/context',
  'packages/core/src/engine/renderers',
  'apps/showcase/src',
  'apps/showcase/src/server',
]

// --- Layer mapping ---
function getLayer(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('packages/core/src/primitives')) return 1
  if (norm.includes('packages/core/src/engine')) return 2
  if (norm.includes('apps/showcase')) return 3
  return 0
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
    /import\s+(?:\{[^}]*\}|[\w]+)\s+from\s+['"]([^'"]+)['"]/g,
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
    for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']) {
      if (existsSync(resolved + ext)) return resolved + ext
    }
    return resolved
  }
  return null // External package
}

// --- Get TS/TSX files in directory ---
function getSourceFiles(dirPath) {
  if (!existsSync(dirPath)) return []
  return readdirSync(dirPath)
    .filter(f => /\.(ts|tsx)$/.test(f) && !f.endsWith('.d.ts') && !f.endsWith('.gen.ts'))
    .sort()
}

// --- Classify export type ---
function classifyExport(keyword) {
  const map = {
    'interface': 'interface',
    'type': 'type',
    'class': 'class',
    'function': 'function',
    'const': 'const',
    'enum': 'enum',
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

    // Build file entry
    if (exports.length === 0) {
      // No exports detected — might be a route or default export
      const existing = existingContext?.files?.[file]
      filesMap[file] = existing || {
        export: '*',
        type: 'component',
        desc: basename(file, extname(file)),
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
        desc: existing?.desc || exp.name,
      }
    } else {
      // Multi-export file
      const existing = existingContext?.files?.[file]
      const names = exports.map(e => e.name).join(', ')
      const types = [...new Set(exports.map(e => classifyExport(e.keyword)))]
      filesMap[file] = {
        export: names,
        type: types.length === 1 ? types[0] : 'const',
        desc: existing?.desc || `Exports ${exports.length} symbols`,
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
      } else if (!imp.startsWith('.')) {
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
    $schema: schemaRelPath,
    layer,
    purpose,
    files: filesMap,
    ...(Object.keys(rels).length > 0 ? { rels } : {}),
    ...(Object.keys(extDeps).length > 0 ? { extDeps } : {}),
  }
}

// --- Build symbol index from all context files ---
function buildSymbolIndex(contexts) {
  const symbols = {}

  for (const { dirPath, context } of contexts) {
    for (const [file, meta] of Object.entries(context.files)) {
      if (meta.type === 're-export') continue

      const names = meta.export.split(',').map(n => n.trim())
      for (const name of names) {
        if (name === '*') continue
        const filePath = posix.join(dirPath, file).replace(/\\/g, '/')
        symbols[name] = {
          file: filePath,
          type: meta.type,
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

// --- Write context file ---
function writeContextFile(dirPath, data) {
  const absDir = resolve(ROOT, dirPath)
  const contextPath = join(absDir, '.context.json')
  const content = JSON.stringify(data, null, 2) + '\n'
  writeFileSync(contextPath, content, 'utf-8')
  return { path: contextPath, content }
}

// --- Validate token budget ---
function validateTokenBudget(filePath, content) {
  const budgets = {
    'context.json': { maxTokens: 200, maxLines: 30 },
    'symbol-index.json': { maxTokens: 600, maxLines: 100 },
  }

  let matched = null
  for (const [suffix, budget] of Object.entries(budgets)) {
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

// --- Main ---
function main() {
  console.log('🔄 Generating AI context files...\n')

  const contexts = []

  for (const dirPath of SCAN_DIRS) {
    const context = buildContextForDir(dirPath)
    if (!context) {
      console.log(`  ⏭️  ${dirPath} — no source files found, skipping`)
      continue
    }

    const { path: outPath, content } = writeContextFile(dirPath, context)
    const warnings = validateTokenBudget(outPath, content)
    const tokenEst = estimateTokens(content, true)

    console.log(`  ✅ ${dirPath}/.context.json (${tokenEst} tokens)`)
    if (warnings) {
      for (const w of warnings) console.log(`     ⚠️  ${w}`)
    }

    contexts.push({ dirPath, context })
  }

  // Generate symbol index
  const symbolIndex = buildSymbolIndex(contexts)
  const symbolIndexPath = join(ROOT, 'docs', 'ai', 'symbol-index.json')
  const symbolContent = JSON.stringify(symbolIndex, null, 2) + '\n'
  mkdirSync(dirname(symbolIndexPath), { recursive: true })
  writeFileSync(symbolIndexPath, symbolContent, 'utf-8')

  const symbolTokens = estimateTokens(symbolContent, true)
  console.log(`\n  ✅ docs/ai/symbol-index.json (${symbolTokens} tokens, ${Object.keys(symbolIndex.symbols).length} symbols)`)

  const warnings = validateTokenBudget(symbolIndexPath, symbolContent)
  if (warnings) {
    for (const w of warnings) console.log(`     ⚠️  ${w}`)
  }

  console.log('\n✨ AI context generation complete!')
}

main()