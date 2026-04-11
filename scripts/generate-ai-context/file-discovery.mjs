// NOTE: File discovery utilities for the AI context generation system.
// NOTE: Handles recursive directory walking, source file listing, and import resolution.

import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'fs'
import { join, resolve, dirname, basename, relative } from 'path'
import { ROOT, SKIP_DIRS } from './constants.mjs'
import { isSourceFile } from '../shared/file-helpers.mjs'

/**
 * NOTE: Recursively discovers all directories containing TypeScript source files
 * under the given root path. Returns relative paths from project root.
 */
export function discoverSourceDirs(rootPath) {
  const results = []
  const absRoot = resolve(ROOT, rootPath)
  if (!existsSync(absRoot)) return results

  function walk(dir) {
    let hasSource = false
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name))
      } else if (isSourceFile(entry.name)) {
        hasSource = true
      }
    }
    if (hasSource) results.push(relativeToRoot(dir))
  }

  walk(absRoot)
  return results.sort()
}

/**
 * NOTE: Returns sorted list of TypeScript source file names in a directory.
 * Excludes .d.ts and .gen.ts files.
 */
export function getSourceFiles(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return []
  return readdirSync(absDir, { withFileTypes: true })
    .filter(d => d.isFile() && isSourceFile(d.name))
    .map(d => d.name)
    .sort()
}

/**
 * NOTE: Resolves a relative import path to an absolute file path.
 * Tries common extensions (.ts, .tsx, /index.ts, /index.tsx).
 * Returns null for non-relative imports (npm packages).
 */
export function resolveImport(importPath, fromFile) {
  if (!importPath.startsWith('.')) return null

  const resolved = resolve(dirname(fromFile), importPath)
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    if (existsSync(resolved + ext)) return resolved + ext
  }
  return null
}

/**
 * NOTE: Detects the primary language of source files in a directory.
 * Returns 'typescript-jsx' if .tsx files exist, otherwise 'typescript'.
 */
export function detectLanguage(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  if (!existsSync(absDir)) return 'typescript'
  const files = readdirSync(absDir)
  if (files.some(f => f.endsWith('.tsx'))) return 'typescript-jsx'
  if (files.some(f => f.endsWith('.ts'))) return 'typescript'
  return 'typescript'
}

/**
 * NOTE: Checks whether a .context.json file is fresh (newer than all source files).
 * Returns false if context doesn't exist or any source file is newer.
 */
export function isContextFresh(dirPath) {
  const absDir = resolve(ROOT, dirPath)
  const contextPath = join(absDir, '.context.json')
  if (!existsSync(contextPath)) return false
  try {
    const contextMtime = statSync(contextPath).mtimeMs
    // NOTE: Pass original dirPath — getSourceFiles resolves against ROOT internally.
    for (const file of getSourceFiles(dirPath)) {
      if (statSync(join(absDir, file)).mtimeMs > contextMtime) return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * NOTE: Loads and parses an existing .context.json for a directory.
 * Returns null if file doesn't exist or has invalid JSON.
 */
export function loadExistingContext(dirPath) {
  const contextPath = join(resolve(ROOT, dirPath), '.context.json')
  if (!existsSync(contextPath)) return null
  try {
    return JSON.parse(readFileSync(contextPath, 'utf-8'))
  } catch {
    return null
  }
}

/**
 * NOTE: Convenience wrapper — discovers all source directories across scan roots.
 */
export function discoverAllDirs(scanRoots) {
  return scanRoots.flatMap(root => discoverSourceDirs(root))
}

// NOTE: Helper — converts absolute path to relative path from ROOT with forward slashes.
function relativeToRoot(absPath) {
  return relative(ROOT, absPath).replace(/\\/g, '/')
}