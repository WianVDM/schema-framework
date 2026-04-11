// NOTE: Context map freshness and description quality validation.
// NOTE: Uses shared isSourceFile() instead of inline regex.

import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, resolve, relative } from 'path'
import { ROOT, SCAN_ROOTS, SKIP_DIRS } from '../shared/constants.mjs'
import { isSourceFile } from '../shared/file-helpers.mjs'

/**
 * NOTE: Validates .context.json freshness across all scan roots.
 * Checks: source files newer than context, description quality, purpose field.
 */
export function checkContextFreshness(collector) {
  for (const root of SCAN_ROOTS) {
    const absRoot = resolve(ROOT, root)
    if (!existsSync(absRoot)) continue
    checkDirRecursive(absRoot, collector)
  }
}

/**
 * NOTE: Recursively walks directories checking .context.json freshness and quality.
 * Flags stale contexts (source files newer) and TODO-prefixed descriptions.
 */
function checkDirRecursive(dirPath, collector) {
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const skipDirs = new Set([...SKIP_DIRS, 'ui'])

  const hasContextJson = entries.some(e => e.name === '.context.json')

  if (hasContextJson) {
    const contextPath = join(dirPath, '.context.json')
    const contextMtime = statSync(contextPath).mtimeMs

    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (!isSourceFile(entry.name)) continue

      const filePath = join(dirPath, entry.name)
      if (statSync(filePath).mtimeMs > contextMtime) {
        const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
        collector.addWarning(`Context map stale: ${relPath} — source file "${entry.name}" is newer`)
        break
      }
    }

    // NOTE: Check description quality — flag TODO-prefixed descriptions
    try {
      const contextContent = readFileSync(contextPath, 'utf-8')
      const context = JSON.parse(contextContent)
      if (context.files) {
        for (const [fileName, meta] of Object.entries(context.files)) {
          if (meta.desc && typeof meta.desc === 'string' && meta.desc.startsWith('TODO: ')) {
            const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
            collector.addSuggestion(`Description needed: ${relPath} → ${fileName} ("${meta.desc}")`)
          }
          if (meta.desc && typeof meta.desc === 'string' && meta.desc.length > 60) {
            const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
            collector.addWarning(`Description too long (${meta.desc.length} chars, max 60): ${relPath} → ${fileName}`)
          }
        }
      }
      if (!context.purpose || context.purpose.trim() === '') {
        const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
        collector.addSuggestion(`Purpose field empty: ${relPath} — add a short purpose describing this directory`)
      }
    } catch (err) {
      const relPath = relative(ROOT, contextPath).replace(/\\/g, '/')
      collector.addWarning(`Failed to parse ${relPath}: ${err.message}`)
    }
  }

  // NOTE: Recurse into subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !skipDirs.has(entry.name)) {
      checkDirRecursive(join(dirPath, entry.name), collector)
    }
  }
}