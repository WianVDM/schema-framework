// NOTE: Builds .context.json data for individual directories.
// NOTE: Handles export classification, dependency mapping, and merge with existing context.

import { join, resolve, dirname, basename, extname, posix } from 'path'
import { ROOT } from './constants.mjs'
import { getLayer } from './get-layer.mjs'
import { getSourceFiles, detectLanguage, loadExistingContext, resolveImport } from './file-discovery.mjs'
import { parseFileExports } from './export-parser.mjs'

/**
 * NOTE: Builds the complete context object for a single directory.
 * Returns { context, symbolTypes } or null if the directory has no source files.
 * Merges hand-crafted `desc`, `deprecated`, and `tests` fields from existing .context.json.
 */
export function buildContextForDir(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const files = getSourceFiles(dirPath)
  if (!files.length) return null
  const layer = getLayer(dirPath)
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
    const { internalDeps, externalDepList } = classifyImports(imports, filePath, absDir, file, files)
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

/**
 * NOTE: Builds a single file entry for the .context.json files map.
 * Preserves hand-crafted desc, deprecated, and tests from existing context.
 */
function buildFileEntry(file, exports, existing) {
  // NOTE: No exports found — default entry with TODO description
  if (exports.length === 0) {
    return preserveManualFields({
      export: '*',
      type: 'component',
      desc: `TODO: describe ${basename(file, extname(file))}`,
    }, existing)
  }

  // NOTE: Single re-export (barrel file)
  if (exports.length === 1 && exports[0].type === 're-export') {
    return preserveManualFields({
      export: '*',
      type: 're-export',
      desc: 'Barrel re-exports',
    }, existing)
  }

  // NOTE: Single named export
  if (exports.length === 1) {
    const exp = exports[0]
    return preserveManualFields({
      export: exp.name,
      type: exp.type,
      desc: existing?.desc || `TODO: describe ${exp.name}`,
    }, existing)
  }

  // NOTE: Multiple named exports in one file
  const names = exports.map(e => e.name).join(', ')
  const types = [...new Set(exports.map(e => e.type))]
  return preserveManualFields({
    export: names,
    type: types.length === 1 ? types[0] : 'const',
    desc: existing?.desc || `TODO: describe ${names.split(',')[0].trim()} (+${exports.length - 1} more)`,
  }, existing)
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
 * Returns { internalDeps: string[], externalDepList: string[] }.
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
            internalDeps.push(depFile)
          }
        } else {
          // NOTE: Cross-directory relative import — record as external dependency
          // so it appears in extDeps for context-map-generator and impact graph.
          const absDirPosix = absDir.replace(/\\/g, '/')
          const resolvedPosix = resolved.replace(/\\/g, '/')
          externalDepList.push(posix.relative(absDirPosix, resolvedPosix))
        }
      }
    } else {
      externalDepList.push(imp)
    }
  }

  return { internalDeps, externalDepList }
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