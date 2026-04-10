// NOTE: Shared file-system utilities for all script subsystems.
// NOTE: isSourceFile() extracted from generate-ai-context/file-discovery.mjs.
// NOTE: readPackageJson() extracted from auto-changeset.mjs and compliance-check.mjs.

import { readFileSync, existsSync } from 'fs'

/**
 * NOTE: Checks if a filename is a TypeScript source file.
 * Excludes .d.ts (type declarations) and .gen.ts (auto-generated) files.
 */
export function isSourceFile(name) {
  return /\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts') && !name.endsWith('.gen.ts')
}

/**
 * NOTE: Reads and parses a package.json file.
 * Returns the parsed object, or null if the file doesn't exist or has invalid JSON.
 */
export function readPackageJson(filePath) {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch { return null }
}