// NOTE: Canonical shared constants for all script subsystems.
// NOTE: Previously duplicated in generate-ai-context/constants.mjs — now the single source of truth.
// NOTE: Consumed by generate-ai-context, auto-changeset, and compliance-check.

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// NOTE: Project root — three levels up from this file (scripts/shared/)
export const ROOT = resolve(__dirname, '..', '..')

// NOTE: Root directories to scan recursively (relative to ROOT).
export const SCAN_ROOTS = [
  'packages/core/src/primitives',
  'packages/core/src/engine',
  'apps/showcase/src',
]

// NOTE: Directory names to skip during recursive walking.
export const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.turbo'])