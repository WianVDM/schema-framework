#!/usr/bin/env node

// NOTE: I/O helpers for reading and writing context files.
// NOTE: Provides compressed/pretty JSON serialization, file writing, and check mode.

import { writeFileSync, existsSync, readFileSync, mkdirSync, unlinkSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { ROOT, TIER2_OUTPUT_DIR, options } from './constants.mjs'

/**
 * NOTE: Serializes data to compressed JSON (no whitespace).
 * Used for Tier 2 files where token efficiency matters.
 */
export function serializeCompressed(data) {
  return JSON.stringify(data)
}

/**
 * NOTE: Serializes data to pretty-printed JSON (2-space indent, trailing newline).
 * Used for .context.json files which are human-reviewed.
 */
export function serializePretty(data) {
  return JSON.stringify(data, null, 2) + '\n'
}

/**
 * NOTE: Writes a Tier 2 JSON file to the docs/ai/ directory.
 * Creates parent directories if they don't exist.
 */
export function writeTier2File(fileName, content) {
  const filePath = join(ROOT, TIER2_OUTPUT_DIR, fileName)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * NOTE: Writes a .context.json file to a source directory.
 * Returns the absolute output path.
 */
export function writeContextFile(dirPath, content) {
  const outPath = join(resolve(ROOT, dirPath), '.context.json')
  writeFileSync(outPath, content, 'utf-8')
  return outPath
}

/**
 * NOTE: Checks if an existing file matches expected content (for --check mode).
 * Compares JSON structure while ignoring `generatedAt` timestamps.
 * Logs stale/missing status. Returns true if fresh, false if stale or missing.
 */
export function checkFileFreshness(fileName, expectedContent) {
  const filePath = join(ROOT, TIER2_OUTPUT_DIR, fileName)
  if (!existsSync(filePath)) {
    console.log(`  ❌ ${fileName} — missing`)
    return false
  }
  const actual = readFileSync(filePath, 'utf-8')
  // NOTE: Compare JSON structure, ignoring generatedAt timestamps
  try {
    const actualObj = JSON.parse(actual)
    const expectedObj = JSON.parse(expectedContent)
    delete actualObj.generatedAt
    delete expectedObj.generatedAt
    // NOTE: Also compare layer-level generatedAt inside symbols
    if (actualObj.symbols && expectedObj.symbols) {
      // Symbols content is what matters, not timestamps
    }
    if (JSON.stringify(actualObj) === JSON.stringify(expectedObj)) return true
  } catch {
    // NOTE: Fall back to exact string comparison if JSON parse fails
    if (actual === expectedContent) return true
  }
  console.log(`  ❌ ${fileName} — stale`)
  return false
}

/**
 * NOTE: Removes a file if it exists. Used for cleaning up legacy artifacts.
 */
export function removeFile(filePath) {
  if (existsSync(filePath)) {
    unlinkSync(filePath)
    return true
  }
  return false
}

