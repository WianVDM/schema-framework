// NOTE: Constants and configuration for the AI context generation system.
// NOTE: ROOT, SCAN_ROOTS, SKIP_DIRS are re-exported from scripts/shared/ for backward compatibility.
// NOTE: Consumed by index.mjs, context-builder.mjs, tier2-generator.mjs,
//       context-map-generator.mjs, and external scripts (compliance-check/index.mjs).
// NOTE: Utility functions extracted to single-export modules per coding standards:
//       getLayer → get-layer.mjs, classifyExport → classify-export.mjs,
//       inferCategory → infer-category.mjs

// NOTE: Re-export shared constants — canonical source is scripts/shared/constants.mjs
export { ROOT, SCAN_ROOTS, SKIP_DIRS } from '../shared/constants.mjs'

// NOTE: Mutable CLI options — set by index.mjs before any work begins.
export const options = {
  verbose: false,
  force: false,
  check: false,
  deep: false,
  diff: false,
  governance: true,
}

// NOTE: Fields preserved from existing .context.json during regeneration.
export const MERGE_PRESERVE_FIELDS = ['desc', 'purpose', 'deprecated', 'tests']

// NOTE: Glob patterns for context output files (used by --diff mode).
export const CONTEXT_FILE_GLOBS = ['docs/ai/**/*.json', 'docs/ai/**/*.md', 'docs/ai/**/*.mmd']

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
