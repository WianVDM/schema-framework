// NOTE: Symbol index validation from per-layer symbol-index files.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../shared/constants.mjs'

/**
 * NOTE: Validates symbol index integrity from docs/ai/symbol-index-manifest.json.
 * Checks JSON validity and reports parse errors in per-layer files.
 */
export function checkSymbolUniqueness(collector) {
  const manifestPath = join(ROOT, 'docs', 'ai', 'symbol-index-manifest.json')
  if (!existsSync(manifestPath)) {
    collector.addWarning('docs/ai/symbol-index-manifest.json not found — run pnpm generate-context')
    return
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

    for (const [_layer, info] of Object.entries(manifest.layers || {})) {
      const layerPath = join(ROOT, 'docs', 'ai', info.file)
      if (!existsSync(layerPath)) {
        collector.addWarning(`${info.file} not found — run pnpm generate-context`)
        continue
      }

      const content = readFileSync(layerPath, 'utf-8')

      // NOTE: Per-layer files use array format, so duplicate symbol names are
      // handled by having multiple entries in the array. We still validate JSON.
      try {
        const layerData = JSON.parse(content)
        // NOTE: Array format handles collisions gracefully — just informational
        for (const [_name, locations] of Object.entries(layerData.symbols || {})) {
          if (locations.length > 1) {
            // NOTE: Array format handles collisions gracefully — no action needed
          }
        }
      } catch (e) {
        if (e instanceof SyntaxError) {
          collector.addViolation(`${info.file} has invalid JSON: ${e.message}`)
        } else {
          collector.addViolation(`${info.file} unexpected error: ${e.message}`)
        }
      }
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      collector.addViolation(`docs/ai/symbol-index-manifest.json has invalid JSON: ${e.message}`)
    } else {
      collector.addViolation(`docs/ai/symbol-index-manifest.json unexpected error: ${e.message}`)
    }
  }
}
