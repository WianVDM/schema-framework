#!/usr/bin/env node

// NOTE: Biome lint/format compliance check.
// Runs `biome check` and reports any errors/warnings as compliance violations.

import { spawnSync } from 'node:child_process'

/**
 * NOTE: Runs biome check and categorizes output into violations and warnings.
 * Errors become violations (blocking), warnings remain warnings (non-blocking).
 * This ensures biome rules are enforced as part of the post-build compliance gate.
 */
export function checkBiome(collector) {
  // NOTE: Use spawnSync to reliably capture stdout+stderr from biome.
  // spawnSync doesn't throw on non-zero exit, unlike execSync.

  const result = spawnSync('npx biome check .', {
    encoding: 'utf8',
    windowsHide: true,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  const output = `${result.stdout || ''}\n${result.stderr || ''}`

  // NOTE: Output formats: "Found 3 errors and 17 warnings", "Found 17 warnings.", "Found 3 errors."
  let errors = 0
  let warnings = 0

  const bothMatch = output.match(/Found\s+(\d+)\s+error[s]?\s+and\s+(\d+)\s+warning[s]?/)
  const onlyErrors = output.match(/Found\s+(\d+)\s+error[s]?[.\s]*$/m)
  const onlyWarnings = output.match(/Found\s+(\d+)\s+warning[s]?[.\s]*$/m)

  if (bothMatch) {
    errors = Number.parseInt(bothMatch[1], 10)
    warnings = Number.parseInt(bothMatch[2], 10)
  } else if (onlyErrors) {
    errors = Number.parseInt(onlyErrors[1], 10)
  } else if (onlyWarnings) {
    warnings = Number.parseInt(onlyWarnings[1], 10)
  }

  if (errors > 0) {
    collector.addViolation(
      `Biome: ${errors} error(s), ${warnings} warning(s) — run \`pnpm lint:fix\` to auto-fix`,
    )
  }
  if (warnings > 0) {
    collector.addWarning(
      `Biome: ${warnings} warning(s) — complexity warnings — run \`pnpm lint\` to review`,
    )
  }
}
