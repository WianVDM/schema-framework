// NOTE: Single-pass TypeScript export and import parser.
// NOTE: Reads each file only once, extracting both exports and imports.

import { readFileSync } from 'fs'
import { basename } from 'path'
import { EXPORT_PATTERNS, RE_EXPORT_PATTERNS, options } from './constants.mjs'
import { classifyExport } from './classify-export.mjs'

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
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
      reExportMatches.push(match)
    }
  }

  if (isBarrel && reExportMatches.length > 0) {
    return [{ name: '*', type: 're-export', desc: 'Barrel re-exports' }]
  }

  // NOTE: Extract named exports using all export patterns
  const exports = []
  for (const pattern of EXPORT_PATTERNS) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
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
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1])
    }
  }
  return [...new Set(imports)]
}