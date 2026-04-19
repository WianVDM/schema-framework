// NOTE: Builds .context.json data for individual directories.
// NOTE: Handles export classification, dependency mapping, and merge with existing context.

import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join, posix, resolve } from 'node:path'
import { parseInternalRefs } from './ast-parser.mjs'
import { options, ROOT } from './constants.mjs'
import { parseFileExports } from './export-parser.mjs'
import {
  detectLanguage,
  getSourceFiles,
  loadExistingContext,
  resolveImport,
} from './file-discovery.mjs'
import { getLayer, getLayerConstraints } from './get-layer.mjs'

/**
 * NOTE: Builds the complete context object for a single directory.
 * Returns { context, symbolTypes } or null if the directory has no source files.
 * Merges hand-crafted `desc`, `deprecated`, and `tests` fields from existing .context.json.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: NOTE: Multi-pass AST analysis with merge-from-existing logic; decomposition would scatter the build pipeline
export function buildContextForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const files = getSourceFiles(dirPath)
  if (!files.length) return null
  let layer
  try {
    layer = getLayer(dirPath)
  } catch {
    layer = null
  }
  const language = detectLanguage(dirPath)
  const filesMap = {}
  const rels = {}
  const extDeps = {}
  const symbolTypes = {}
  const existingContext = loadExistingContext(dirPath)

  for (const file of files) {
    const filePath = join(absDir, file)
    const { exports, imports } = parseFileExports(filePath)
    const existing = existingContext?.files?.[file]

    // NOTE: Build symbol type map from parsed exports
    for (const exp of exports) {
      if (exp.name && exp.name !== '*') {
        symbolTypes[exp.name] = exp.type
      }
    }

    // NOTE: Build file entry in the context map
    filesMap[file] = buildFileEntry(file, exports, existing)

    // NOTE: Classify imports into internal (within directory) and external
    const { internalDeps, externalDepList } = classifyImports(
      imports,
      filePath,
      absDir,
      file,
      files,
    )
    if (internalDeps.length > 0) rels[file] = dedupeByPath(internalDeps)
    if (externalDepList.length > 0) extDeps[file] = dedupeByPath(externalDepList)

    // NOTE: Deep mode — extract type references from file content (pass 1: store refs only)
    if (options.deep) {
      const internalRefs = parseInternalRefs(filePath)
      if (internalRefs.length > 0) {
        filesMap[file].internalRefs = internalRefs
      }
    }
  }

  // NOTE: Deep mode pass 2 — now that all files are in filesMap, infer type-level refs
  if (options.deep) {
    for (const [file, meta] of Object.entries(filesMap)) {
      if (!meta.internalRefs) continue
      for (const ref of meta.internalRefs) {
        for (const [otherFile, otherMeta] of Object.entries(filesMap)) {
          if (otherFile === file) continue
          const otherExports = (otherMeta.export || '').split(',').map(n => n.trim())
          if (otherExports.includes(ref)) {
            if (!rels[file]) rels[file] = []
            rels[file].push({ path: otherFile, confidence: 'inferred' })
          }
        }
      }
    }

    // NOTE: Deduplicate inferred refs that may have been added multiple times
    for (const file of Object.keys(rels)) {
      rels[file] = dedupeByPath(rels[file])
    }
  }

  const schemaRelPath = posix.relative(dirPath, 'docs/ai/schemas/context-schema.json')

  // NOTE: Build governance object if enabled
  const governance =
    options.governance && layer
      ? buildGovernance(dirPath, existingContext, { layer, extDeps })
      : undefined

  return {
    context: {
      $schema: schemaRelPath,
      layer,
      language,
      purpose: existingContext?.purpose || '',
      files: filesMap,
      ...(Object.keys(rels).length > 0 ? { rels } : {}),
      ...(Object.keys(extDeps).length > 0 ? { extDeps } : {}),
      ...(governance ? { governance } : {}),
    },
    symbolTypes,
  }
}

/**
 * NOTE: Builds a single file entry for the .context.json files map.
 * Preserves hand-crafted desc, deprecated, and tests from existing context.
 */
function buildFileEntry(file, exports, existing) {
  // NOTE: No exports found — default entry with TODO description
  if (exports.length === 0) {
    return preserveManualFields(
      {
        export: '*',
        type: 'component',
        desc: `TODO: describe ${basename(file, extname(file))}`,
      },
      existing,
    )
  }

  // NOTE: Single re-export (barrel file)
  if (exports.length === 1 && exports[0].type === 're-export') {
    return preserveManualFields(
      {
        export: '*',
        type: 're-export',
        desc: 'Barrel re-exports',
      },
      existing,
    )
  }

  // NOTE: Single named export
  if (exports.length === 1) {
    const exp = exports[0]
    return preserveManualFields(
      {
        export: exp.name,
        type: exp.type,
        desc: existing?.desc || `TODO: describe ${exp.name}`,
      },
      existing,
    )
  }

  // NOTE: Multiple named exports in one file
  const names = exports.map(e => e.name).join(', ')
  const types = [...new Set(exports.map(e => e.type))]
  return preserveManualFields(
    {
      export: names,
      type: types.length === 1 ? types[0] : 'const',
      desc:
        existing?.desc ||
        `TODO: describe ${names.split(',')[0].trim()} (+${exports.length - 1} more)`,
    },
    existing,
  )
}

/**
 * NOTE: Preserves hand-crafted fields (desc, deprecated, tests) from existing .context.json.
 * The desc field is only preserved if it was manually edited (doesn't start with "TODO:").
 */
function preserveManualFields(entry, existing) {
  if (!existing) return entry

  // NOTE: Preserve manually-written descriptions (non-TODO)
  if (existing.desc && !existing.desc.startsWith('TODO: ')) {
    entry.desc = existing.desc
  }

  // NOTE: Always preserve deprecated and tests markers
  if (existing.deprecated !== undefined) entry.deprecated = existing.deprecated
  if (existing.tests !== undefined) entry.tests = existing.tests

  return entry
}

/**
 * NOTE: Splits imports into internal (same directory) and external dependencies.
 * Returns confidence-tagged objects: { internalDeps: { path, confidence }[], externalDepList: { path, confidence }[] }.
 */
function classifyImports(imports, filePath, absDir, currentFile, allFiles) {
  const internalDeps = []
  const externalDepList = []

  for (const imp of imports) {
    if (imp.startsWith('.')) {
      const resolved = resolveImport(imp, filePath)
      if (resolved) {
        const resolvedDir = dirname(resolved)
        if (resolvedDir === absDir) {
          // NOTE: Same-directory import — record as internal dependency
          const depFile = basename(resolved)
          if (depFile !== currentFile && allFiles.includes(depFile)) {
            internalDeps.push({ path: depFile, confidence: 'explicit' })
          }
        } else {
          // NOTE: Cross-directory relative import — record as external dependency
          // so it appears in extDeps for context-map-generator and impact graph.
          const absDirPosix = absDir.replace(/\\/g, '/')
          const resolvedPosix = resolved.replace(/\\/g, '/')
          externalDepList.push({
            path: posix.relative(absDirPosix, resolvedPosix),
            confidence: 'explicit',
          })
        }
      }
    } else {
      externalDepList.push({ path: imp, confidence: 'explicit' })
    }
  }

  return { internalDeps, externalDepList }
}

/**
 * NOTE: Deduplicates an array of { path, confidence } objects by path.
 * Uses a Map for O(1) lookups — keeps the first occurrence when duplicates exist.
 * Exported as a shared utility for use by other modules.
 */
export function dedupeByPath(entries) {
  const map = new Map()
  for (const entry of entries) {
    if (!map.has(entry.path)) {
      map.set(entry.path, entry)
    }
  }
  return [...map.values()]
}

/**
 * NOTE: Parses symbol types from all files in a directory (for cached/fresh contexts).
 * Used when a directory is skipped but we still need symbol data for Tier 2 generation.
 */
export function parseSymbolTypesForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const files = getSourceFiles(dirPath)
  const symbolTypes = {}

  for (const file of files) {
    const { exports } = parseFileExports(join(absDir, file))
    for (const exp of exports) {
      if (exp.name && exp.name !== '*') {
        symbolTypes[exp.name] = exp.type
      }
    }
  }

  return symbolTypes
}

/**
 * NOTE: Constructs a governance object for a directory's .context.json.
 * Infers what it can from layer constraints and extDeps data.
 * Writes TODO markers for fields that require manual specification.
 * Preserves existing governance fields unless --force is set.
 */
export function buildGovernance(_dirPath, existingContext, layerInfo) {
  const existingGov = existingContext?.governance

  // NOTE: Preserve existing governance unless force mode
  if (existingGov && !options.force) {
    return existingGov
  }

  const { layer } = layerInfo
  const { extDeps } = layerInfo
  const layerConstraints = getLayerConstraints(layer)

  // NOTE: Infer importsFrom from extDeps — collect unique external dependency directories
  const inferredImportsFrom = inferImportsFrom(extDeps)

  const governance = {
    importsFrom: inferredImportsFrom,
    importedBy: ['TODO: manually specify allowed consumer directories'],
    constraints: ['TODO: manually specify directory constraints'],
    forbidden: layerConstraints.forbidden,
    inherits: true,
  }

  return governance
}

/**
 * NOTE: Infers importsFrom patterns from extDeps data.
 * Extracts unique directory-level prefixes from external dependency paths.
 */
function inferImportsFrom(extDeps) {
  if (!extDeps || typeof extDeps !== 'object') return []

  const allPaths = new Set()
  for (const depList of Object.values(extDeps)) {
    if (!Array.isArray(depList)) continue
    for (const dep of depList) {
      if (dep?.path && typeof dep.path === 'string' && !dep.path.startsWith('.')) {
        // NOTE: Extract directory-level prefix from resolved relative paths
        const parts = dep.path.replace(/\\/g, '/').split('/')
        if (parts.length >= 3) {
          allPaths.add(`${parts.slice(0, 3).join('/')}/**`)
        } else if (parts.length > 0) {
          allPaths.add(parts.join('/'))
        }
      }
    }
  }

  return [...allPaths].sort()
}

/**
 * NOTE: Resolves inherited governance fields from parent .context.json files.
 * Walks up the directory tree looking for parent contexts.
 * Merges parent governance for fields that are undefined or contain TODO/FIXME markers.
 * Respects inherits: false on the child — returns child as-is.
 */
export function resolveGovernanceInheritance(dirPath, childGovernance) {
  if (!childGovernance || childGovernance.inherits === false) {
    return childGovernance
  }

  // NOTE: Walk up directory tree to find parent .context.json files
  const parts = dirPath.replace(/\\/g, '/').split('/')
  for (let i = parts.length - 1; i > 0; i--) {
    const parentDir = parts.slice(0, i).join('/')
    const contextPath = join(ROOT, parentDir, '.context.json')

    if (!existsSync(contextPath)) continue

    try {
      const raw = readFileSync(contextPath, 'utf-8')
      const parentContext = JSON.parse(raw)
      const parentGov = parentContext.governance

      if (!parentGov) continue
      if (parentGov.inherits === false) continue

      // NOTE: Merge parent governance for unresolved fields
      return mergeGovernance(childGovernance, parentGov)
    } catch {
      // NOTE: Malformed .context.json — skip parent inheritance
    }
  }

  return childGovernance
}

/**
 * NOTE: Merges parent governance into child for fields that are unresolved.
 * A field is unresolved if it is undefined, empty, or contains TODO/FIXME markers.
 */
function mergeGovernance(child, parent) {
  const result = { ...child }
  const governableFields = ['importsFrom', 'importedBy', 'constraints', 'forbidden']

  for (const field of governableFields) {
    const childVal = child[field]
    const parentVal = parent[field]

    // NOTE: Skip if parent doesn't define this field
    if (!(parentVal && Array.isArray(parentVal))) continue

    // NOTE: Child field is unresolved — inherit from parent
    if (
      !(childVal && Array.isArray(childVal)) ||
      childVal.length === 0 ||
      childVal.some(v => typeof v === 'string' && (v.startsWith('TODO:') || v.startsWith('FIXME:')))
    ) {
      result[field] = parentVal
    }
  }

  return result
}
