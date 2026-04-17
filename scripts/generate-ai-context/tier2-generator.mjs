// NOTE: Tier 2 artifact generators — symbol indexes, impact graph, directory index,
//       core abstractions, insights, community map, last diff.
// NOTE: All outputs are compressed JSON written to docs/ai/.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { ROOT, TIER2_OUTPUT_DIR } from './constants.mjs'
import { getLayer } from './get-layer.mjs'
import { inferCategory } from './infer-category.mjs'
import { removeFile } from './io-helpers.mjs'
import { estimateTokens } from './token-budget.mjs'

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
      if (!meta.export) continue
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
      for (const depEntry of deps) {
        // NOTE: Support both old string format and new { path, confidence } format
        const depPath = typeof depEntry === 'string' ? depEntry : depEntry.path
        if (!depPath.startsWith('.')) continue
        const fromPath = posix.join(dirPath, file)
        const normalizedDep = normalizePath(depPath)
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
    if (part === '..') {
      // NOTE: If stack is empty or top is already '..', push another '..'
      if (resolved.length === 0 || resolved[resolved.length - 1] === '..') {
        resolved.push('..')
      } else {
        // NOTE: Cancel out the previous segment
        resolved.pop()
      }
    } else if (part !== '.') {
      // NOTE: Normal segment — push onto stack
      resolved.push(part)
    }
  }
  return resolved.join('/')
}

/**
 * NOTE: Generates core-abstractions.json — top N most-depended-on exports.
 * Uses the impact graph data to find "god nodes" consumed by many files.
 * Accepts the parsed consumedBy object directly (no double-parsing).
 * Returns { file, content, tokens, count }.
 */
export function generateCoreAbstractions(contexts, consumedBy) {
  consumedBy = consumedBy || {}
  const abstractions = []

  // NOTE: Build a map from filePath to its export info across all contexts
  const fileExportMap = {}
  for (const { dirPath, context } of contexts) {
    for (const [file, meta] of Object.entries(context.files)) {
      const fullPath = posix.join(dirPath, file)
      fileExportMap[fullPath] = { export: meta.export, dirPath, layer: context.layer }
    }
  }

  for (const [filePath, consumers] of Object.entries(consumedBy)) {
    if (consumers.length < 3) continue
    const info = fileExportMap[filePath]
    if (!info) continue

    // NOTE: Collect unique layers where this file is consumed
    const consumerLayers = new Set()
    for (const consumer of consumers) {
      try {
        const consumerLayer = getLayer(consumer)
        consumerLayers.add(consumerLayer)
      } catch {
        // NOTE: Skip consumers in unknown layers
      }
    }
    try {
      const producerLayer = info.layer || getLayer(info.dirPath)
      consumerLayers.add(producerLayer)
    } catch {
      // NOTE: Skip if producer layer is unknown
    }

    // NOTE: Ensure layerSpan is never empty — skip entries with no determinable layer
    if (consumerLayers.size === 0) continue

    abstractions.push({
      export: info.export,
      file: filePath,
      consumedBy: consumers,
      consumerCount: consumers.length,
      layerSpan: [...consumerLayers].sort(),
    })
  }

  // NOTE: Sort by consumer count descending, take top 10
  abstractions.sort((a, b) => b.consumerCount - a.consumerCount)
  const top = abstractions.slice(0, 10)

  const data = {
    $schema: 'schemas/core-abstractions-schema.json',
    generatedAt: new Date().toISOString(),
    abstractions: top,
  }
  const content = JSON.stringify(data)
  return {
    file: 'core-abstractions.json',
    content,
    tokens: estimateTokens(content, true),
    count: top.length,
  }
}

/**
 * NOTE: Generates insights.json — cross-layer deps, high-impact files, circular warnings.
 * Accepts the parsed consumedBy object directly (no double-parsing).
 * Returns { file, content, tokens }.
 */
export function generateInsights(contexts, consumedBy) {
  const crossLayerDeps = []
  const highImpactFiles = []
  const circularWarnings = []

  // NOTE: Detect cross-layer dependencies
  for (const { dirPath, context } of contexts) {
    if (!context.extDeps) continue
    const sourceLayer = context.layer
    for (const [file, deps] of Object.entries(context.extDeps)) {
      for (const depEntry of deps) {
        const depPath = typeof depEntry === 'string' ? depEntry : depEntry.path
        if (!depPath.startsWith('.')) continue
        const normalizedDep = normalizePath(depPath)
        let targetLayer
        try {
          targetLayer = getLayer(normalizedDep)
        } catch {
          // NOTE: Skip deps in unknown layers
          continue
        }
        if (targetLayer !== sourceLayer) {
          crossLayerDeps.push({
            source: posix.join(dirPath, file),
            target: normalizedDep,
            sourceLayer,
            targetLayer,
            note:
              targetLayer < sourceLayer
                ? 'downward dependency (valid)'
                : 'upward dependency (violation)',
          })
        }
      }
    }
  }

  // NOTE: Detect high-impact files from impact graph
  consumedBy = consumedBy || {}
  for (const [filePath, consumers] of Object.entries(consumedBy)) {
    if (consumers.length < 2) continue
    const layers = new Set()
    for (const consumer of consumers) {
      try {
        const layer = getLayer(consumer)
        layers.add(layer)
      } catch {
        // NOTE: Skip consumers in unknown layers
      }
    }
    highImpactFiles.push({
      file: filePath,
      consumerCount: consumers.length,
      layerSpan: [...layers].sort(),
    })
  }
  highImpactFiles.sort((a, b) => b.consumerCount - a.consumerCount)

  // NOTE: Detect circular dependencies via DFS with mutable path (avoids O(depth) allocation per step)
  const adjList = buildDirectoryAdjacencyList(contexts)
  const visited = new Set()
  const recStack = new Set()
  const cycles = []
  const path = []

  function dfs(node) {
    visited.add(node)
    recStack.add(node)
    path.push(node)
    for (const neighbor of adjList[node] || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor)
      } else if (recStack.has(neighbor)) {
        // NOTE: Found a cycle — extract the cycle path
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart))
        }
      }
    }
    path.pop()
    recStack.delete(node)
  }

  for (const node of Object.keys(adjList)) {
    if (!visited.has(node)) dfs(node)
  }

  for (const cycle of cycles) {
    circularWarnings.push({ cycle })
  }

  const data = {
    $schema: 'schemas/insights-schema.json',
    generatedAt: new Date().toISOString(),
    insights: {
      crossLayerDeps,
      highImpactFiles: highImpactFiles.slice(0, 20),
      circularWarnings,
    },
  }
  const content = JSON.stringify(data)
  return { file: 'insights.json', content, tokens: estimateTokens(content, true) }
}

/**
 * NOTE: Generates community-map.json — directory clusters by shared external dependencies.
 * Uses Jaccard similarity on extDeps to find related directories.
 * Returns { file, content, tokens, count }.
 */
export function generateCommunityMap(contexts) {
  // NOTE: Build extDeps sets per directory
  const dirExtDeps = {}
  for (const { dirPath, context } of contexts) {
    const deps = new Set()
    if (context.extDeps) {
      for (const depsList of Object.values(context.extDeps)) {
        for (const depEntry of depsList) {
          const depPath = typeof depEntry === 'string' ? depEntry : depEntry.path
          if (!depPath.startsWith('.')) deps.add(depPath)
        }
      }
    }
    dirExtDeps[dirPath] = deps
  }

  // NOTE: Compute Jaccard similarity between all directory pairs
  const dirs = Object.keys(dirExtDeps)
  const communities = []
  const assigned = new Set()

  for (let i = 0; i < dirs.length; i++) {
    if (assigned.has(dirs[i])) continue
    const community = [dirs[i]]
    assigned.add(dirs[i])

    for (let j = i + 1; j < dirs.length; j++) {
      if (assigned.has(dirs[j])) continue
      const similarity = jaccardSimilarity(dirExtDeps[dirs[i]], dirExtDeps[dirs[j]])
      if (similarity >= 0.3) {
        community.push(dirs[j])
        assigned.add(dirs[j])
      }
    }

    if (community.length > 1) {
      // NOTE: Find shared deps across community members
      const sharedDeps = [...dirExtDeps[community[0]]]
      for (let k = 1; k < community.length; k++) {
        const currentDeps = dirExtDeps[community[k]]
        for (let d = sharedDeps.length - 1; d >= 0; d--) {
          if (!currentDeps.has(sharedDeps[d])) sharedDeps.splice(d, 1)
        }
      }

      // NOTE: Compute cohesion score
      const allDeps = new Set()
      for (const dir of community) {
        for (const dep of dirExtDeps[dir]) allDeps.add(dep)
      }
      const cohesionScore = allDeps.size > 0 ? sharedDeps.length / allDeps.size : 0

      communities.push({
        label: community.map(d => d.split('/').pop()).join(' + '),
        directories: community,
        sharedDeps,
        cohesionScore: Math.round(cohesionScore * 100) / 100,
      })
    }
  }

  const data = {
    $schema: 'schemas/community-map-schema.json',
    generatedAt: new Date().toISOString(),
    communities,
  }
  const content = JSON.stringify(data)
  return {
    file: 'community-map.json',
    content,
    tokens: estimateTokens(content, true),
    count: communities.length,
  }
}

/**
 * NOTE: Generates last-diff.json — tracks what changed since last generation.
 * Compares current output hashes against previously stored state.
 * Returns { file, content, tokens }.
 */
export function generateLastDiff(currentOutputs) {
  const statePath = join(ROOT, TIER2_OUTPUT_DIR, '.last-state.json')
  const added = []
  const removed = []
  const modified = []

  // NOTE: Build current state map: file → content hash
  const currentState = {}
  for (const { file, content } of currentOutputs) {
    currentState[file] = hashContent(content)
  }

  // NOTE: Load previous state
  let previousState = {}
  if (existsSync(statePath)) {
    try {
      previousState = JSON.parse(readFileSync(statePath, 'utf-8'))
    } catch {
      previousState = {}
    }
  }

  // NOTE: Compute diff (exclude metadata keys prefixed with _)
  const allFiles = new Set([...Object.keys(currentState), ...Object.keys(previousState)])
  for (const file of allFiles) {
    if (file.startsWith('_')) continue
    if (!previousState[file]) {
      added.push(file)
    } else if (!currentState[file]) {
      removed.push(file)
    } else if (previousState[file] !== currentState[file]) {
      modified.push(file)
    }
  }

  const summary = `${added.length} added, ${removed.length} removed, ${modified.length} modified`
  const generatedAt = new Date().toISOString()

  const data = {
    $schema: 'schemas/last-diff-schema.json',
    generatedAt,
    added,
    removed,
    modified,
    summary,
  }
  const content = JSON.stringify(data)

  // NOTE: Store current state for next diff comparison (add metadata after diff)
  currentState._generatedAt = generatedAt

  return {
    file: 'last-diff.json',
    content,
    tokens: estimateTokens(content, true),
    newState: JSON.stringify(currentState),
  }
}

// NOTE: Computes Jaccard similarity between two sets: |A∩B| / |A∪B|.
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1
  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

// NOTE: Builds a directory-level adjacency list from extDeps for circular dependency detection.
function buildDirectoryAdjacencyList(contexts) {
  const adjList = {}
  for (const { dirPath, context } of contexts) {
    if (!context.extDeps) continue
    adjList[dirPath] = adjList[dirPath] || []
    for (const deps of Object.values(context.extDeps)) {
      for (const depEntry of deps) {
        const depPath = typeof depEntry === 'string' ? depEntry : depEntry.path
        if (!depPath.startsWith('.')) continue
        // NOTE: Resolve to directory level
        const normalizedDep = normalizePath(depPath)
        const depDir = posix.dirname(normalizedDep)
        if (depDir !== dirPath && !(adjList[dirPath] || []).includes(depDir)) {
          adjList[dirPath].push(depDir)
        }
      }
    }
  }
  return adjList
}

// NOTE: Hashes content using MD5 for fast change detection.
function hashContent(content) {
  return createHash('md5').update(content).digest('hex')
}
