// NOTE: Single-pass TypeScript export and import parser.
// NOTE: Reads each file only once, extracting both exports and imports.

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { classifyExport } from './classify-export.mjs'
import { EXPORT_PATTERNS, options, RE_EXPORT_PATTERNS } from './constants.mjs'

/**
 * NOTE: Parses a single TypeScript file, extracting both exports and imports.
 * Reads the file only once for performance (fixes the original double-read issue).
 * Returns null and logs a warning if the file cannot be read.
 */
export function parseFileExports(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return {
      exports: extractExports(content, filePath),
      imports: extractImports(content),
    }
  } catch (err) {
    if (options.verbose) {
      console.warn(`  WARNING: Failed to parse ${filePath}: ${err.message}`)
    }
    return { exports: [], imports: [] }
  }
}

/**
 * NOTE: Extracts named exports from file content.
 * Returns an array of { name, keyword, type } objects.
 * Barrel files with only re-exports return a single { name: '*', type: 're-export' } entry.
 */
function extractExports(content, filePath) {
  const isBarrel = basename(filePath).startsWith('index.')

  // NOTE: Check for re-export patterns first (barrel detection)
  const reExportMatches = []
  for (const pattern of RE_EXPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      reExportMatches.push(match)
    }
  }

  if (isBarrel && reExportMatches.length > 0) {
    return [{ name: '*', type: 're-export', desc: 'Barrel re-exports' }]
  }

  // NOTE: Extract named exports using all export patterns
  const exports = []
  for (const pattern of EXPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const keyword = match[0].split(/\s+/)[1]
      exports.push({
        name: match[1],
        keyword,
        type: classifyExport(keyword),
      })
    }
  }
  return exports
}

/**
 * NOTE: Extracts import paths from file content.
 * Returns deduplicated array of import path strings.
 */
function extractImports(content) {
  const imports = []
  const patterns = [
    /import\s+(?:type\s+)?(?:(?:\{[^}]*\}|[\w]+|\*\s+as\s+\w+))\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
  ]
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      imports.push(match[1])
    }
  }
  return [...new Set(imports)]
}
