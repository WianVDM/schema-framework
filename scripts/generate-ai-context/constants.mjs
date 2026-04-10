#!/usr/bin/env node

// NOTE: Shared constants and configuration for the AI context generation system.
// NOTE: Consumed by index.mjs, context-builder.mjs, tier2-generator.mjs,
//       context-map-generator.mjs, and external scripts (compliance-check.mjs).

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// NOTE: Project root — two levels up from this file (scripts/generate-ai-context/)
export const ROOT = resolve(__dirname, '..', '..')

// NOTE: Mutable CLI options — set by index.mjs before any work begins.
export const options = {
  verbose: false,
  force: false,
  check: false,
}

// NOTE: Root directories to scan recursively (relative to ROOT).
export const SCAN_ROOTS = [
  'packages/core/src/primitives',
  'packages/core/src/engine',
  'apps/showcase/src',
]

// NOTE: Directory names to skip during recursive walking.
export const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.turbo'])

// NOTE: Output directory for Tier 2 files (relative to ROOT).
export const TIER2_OUTPUT_DIR = 'docs/ai'

// NOTE: Regex patterns for detecting named exports in TypeScript source files.
export const EXPORT_PATTERNS = [
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)/g,
  /export\s+class\s+(\w+)/g,
  /export\s+function\s+(\w+)/g,
  /export\s+enum\s+(\w+)/g,
  /export\s+const\s+(\w+)/g,
]

// NOTE: Regex patterns for detecting re-export statements (barrel files).
export const RE_EXPORT_PATTERNS = [
  /export\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g,
  /export\s+\*\s+from\s+['"]([^'"]+)['"]/g,
  /export\s+type\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g,
]

/**
 * NOTE: Maps a directory path to its architectural layer number.
 * Layer 1 = Primitives, Layer 2 = Engine, Layer 3 = Composition.
 */
export function getLayer(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('packages/core/src/primitives')) return 1
  if (norm.includes('packages/core/src/engine')) return 2
  if (norm.includes('apps/showcase')) return 3
  throw new Error(`Unknown layer for directory: ${dirPath}`)
}

/**
 * NOTE: Maps an export keyword (interface, type, class, etc.) to a
 * normalized type string used in .context.json files.
 */
export function classifyExport(keyword) {
  const map = {
    interface: 'interface',
    type: 'type',
    class: 'component',
    function: 'function',
    const: 'const',
    enum: 'const',
  }
  return map[keyword] || 'const'
}

/**
 * NOTE: Infers a directory's category from its path segments.
 * Used by Tier 2 symbol indexes for categorization.
 */
export function inferCategory(dirPath) {
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