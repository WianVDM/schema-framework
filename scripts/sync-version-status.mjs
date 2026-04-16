// NOTE: Post-changeset hook that syncs docs/VERSION_STATUS.md with package.json version.
// NOTE: Called by release.yml after `pnpm changeset version` to keep VERSION_STATUS.md in sync.

import { readFileSync, writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')

const STATUS_PATH = join(ROOT, 'docs', 'VERSION_STATUS.md')
const CORE_PKG_PATH = join(ROOT, 'packages', 'core', 'package.json')

/**
 * NOTE: Reads version from packages/core/package.json.
 * Returns the version string or null on failure.
 */
function readCoreVersion() {
    try {
        const raw = readFileSync(CORE_PKG_PATH, 'utf-8')
        const pkg = JSON.parse(raw)
        return pkg.version || null
    } catch {
        return null
    }
}

/**
 * NOTE: Calculates the next patch version (e.g., "0.3.1" → "0.3.2").
 */
function nextPatch(version) {
    const parts = version.split('.').map(Number)
    parts[2] += 1
    return parts.join('.')
}

/**
 * NOTE: Syncs VERSION_STATUS.md Current Version and Target Version with package.json.
 * Only updates if the values differ — preserves all other content.
 */
function syncVersionStatus() {
    const coreVersion = readCoreVersion()
    if (!coreVersion) {
        console.error('ERROR: Could not read version from packages/core/package.json')
        process.exit(1)
    }

    let content = readFileSync(STATUS_PATH, 'utf-8')

    const currentVersionMatch = content.match(/##\s*Current Version:\s*(\S+)/)
    if (!currentVersionMatch) {
        console.error('ERROR: Could not parse "Current Version" from VERSION_STATUS.md')
        process.exit(1)
    }

    const statedCurrent = currentVersionMatch[1]
    const newTarget = nextPatch(coreVersion)

    let changed = false

    if (statedCurrent !== coreVersion) {
        content = content.replace(
            /##\s*Current Version:\s*\S+/,
            `## Current Version: ${coreVersion}`
        )
        changed = true
    }

    const targetVersionMatch = content.match(/##\s*Target Version:\s*(\S+)/)
    if (targetVersionMatch && targetVersionMatch[1] !== newTarget) {
        content = content.replace(
            /##\s*Target Version:\s*\S+/,
            `## Target Version: ${newTarget}`
        )
        changed = true
    }

    if (changed) {
        writeFileSync(STATUS_PATH, content, 'utf-8')
        console.log(`Synced VERSION_STATUS.md: Current=${coreVersion}, Target=${newTarget}`)
    } else {
        console.log('VERSION_STATUS.md already in sync — no changes needed')
    }
}

syncVersionStatus()