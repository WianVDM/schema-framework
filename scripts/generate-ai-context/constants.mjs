// NOTE: Shared constants and configuration for the AI context generation system.
// NOTE: Consumed by index.mjs, context-builder.mjs, tier2-generator.mjs,
//       context-map-generator.mjs, and external scripts (compliance-check.mjs).
// NOTE: Utility functions extracted to single-export modules per coding standards:
//       getLayer → get-layer.mjs, classifyExport → classify-export.mjs,
//       inferCategory → infer-category.mjs

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