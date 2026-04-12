import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { SCAN_ROOTS } from './scripts/shared/constants.mjs'

const files = []
for (const root of SCAN_ROOTS) {
  try {
    const entries = readdirSync(root, { recursive: true, withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && entry.name === '.context.json') {
        // Handle Node.js < 20 where parentPath is not available
        const parentPath = entry.parentPath || entry.path
        files.push(join(parentPath, entry.name))
      }
    }
  } catch (e) {
    console.error(`Failed to scan directory ${root}: ${e.message}`)
    process.exitCode = 1
  }
}

let found = false
for (const f of files) {
  try {
    const d = JSON.parse(readFileSync(f, 'utf8'))
    if (d.purpose && d.purpose.includes('|')) {
      console.log('PIPE FOUND in:', f, '-- purpose:', d.purpose)
      found = true
      process.exitCode = 1
    }
  } catch (e) {
    console.error(`Failed to read or parse ${f}: ${e.message}`)
    process.exitCode = 1
  }
}

if (!found) console.log('No pipe characters found in any purpose field.')