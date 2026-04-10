// NOTE: Tier 2 artifact generators — symbol indexes, impact graph, directory index.
// NOTE: All outputs are compressed JSON written to docs/ai/.

import { existsSync } from 'fs'
import { join, posix } from 'path'
import { ROOT, TIER2_OUTPUT_DIR } from './constants.mjs'
import { inferCategory } from './infer-category.mjs'
import { estimateTokens } from './token-budget.mjs'
import { removeFile } from './io-helpers.mjs'

/**
 * NOTE: Generates per-layer symbol index files and a manifest.
 * Each layer gets its own JSON file mapping symbol names to their file locations.
 * Returns array of { file, content, count, tokens } for writing/logging.
 */
export function generateSymbolIndexes(contexts) {
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
    const content = JSON.stringify(layerObj)
    const count = Object.keys(symbols).length
    totalSymbols += count
    outputs.push({ file, content, count, tokens: estimateTokens(content, true) })
    manifestLayers[layer] = { file, symbols: count }
  }

  // NOTE: Build manifest aggregating all layers
  const manifest = {
    $schema: 'schemas/symbol-index-manifest-schema.json',
    generatedAt: new Date().toISOString(),
    totalSymbols,
    layers: manifestLayers,
  }
  const manifestContent = JSON.stringify(manifest)
  outputs.push({
    file: 'symbol-index-manifest.json',
    content: manifestContent,
    count: totalSymbols,
    tokens: estimateTokens(manifestContent, true),
  })

  // NOTE: Clean up old monolithic symbol-index.json if it exists
  const oldPath = join(ROOT, TIER2_OUTPUT_DIR, 'symbol-index.json')
  if (removeFile(oldPath)) {
    console.log('  🗑️  Removed old docs/ai/symbol-index.json')
  }

  return outputs
}

/**
 * NOTE: Generates the impact graph — maps each file to all files that import it.
 * Returns { content, tokens, entries }.
 */
export function generateImpactGraph(contexts) {
  const consumedBy = {}

  for (const { dirPath, context } of contexts) {
    if (!context.extDeps) continue
    for (const [file, deps] of Object.entries(context.extDeps)) {
      for (const dep of deps) {
        if (!dep.startsWith('.')) continue
        const fromPath = posix.join(dirPath, file)
        const normalizedDep = normalizePath(dep)
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
  const content = JSON.stringify(data)
  return { content, tokens: estimateTokens(content, true), entries: Object.keys(consumedBy).length }
}

/**
 * NOTE: Generates the directory index — maps each source directory to its purpose.
 * Returns { content, tokens, count }.
 */
export function generateDirectoryIndex(contexts) {
  const directories = {}
  for (const { dirPath, context } of contexts) {
    directories[dirPath] = context.purpose || ''
  }
  const data = {
    $schema: 'schemas/directory-index-schema.json',
    generatedAt: new Date().toISOString(),
    directories,
  }
  const content = JSON.stringify(data)
  return { content, tokens: estimateTokens(content, true), count: Object.keys(directories).length }
}

// NOTE: Normalizes a relative path by resolving .. and . segments.
function normalizePath(dep) {
  const parts = dep.split('/')
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return resolved.join('/')
}