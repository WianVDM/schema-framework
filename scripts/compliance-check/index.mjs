#!/usr/bin/env node

/**
 * Compliance Check — CLI Entry Point
 *
 * Post-build validation runner. Validates project health after `pnpm build`:
 * - VERSION_STATUS.md version consistency vs package.json files
 * - CHANGELOG.md existence for published packages
 * - .context.json freshness (source files newer than context)
 * - Description quality (generic/auto-generated descriptions flagged)
 * - Symbol uniqueness (no duplicate exports across files)
 * - Biome lint/format compliance (errors block, warnings warn)
 *
 * Output: Structured report with violations and suggestions.
 * Exit code: 0 if no violations, 1 if any violations found.
 */

import { SeverityCollector } from '../shared/output-helpers.mjs'
import { checkBiome } from './check-biome.mjs'
import { checkChangelogs } from './check-changelogs.mjs'
import { checkContextFreshness } from './check-context-freshness.mjs'
import { checkSymbolUniqueness } from './check-symbol-uniqueness.mjs'
import { checkVersionStatus } from './check-version-status.mjs'

function main() {
  console.log('\n🔍 Compliance Check Results:\n')

  const collector = new SeverityCollector()

  checkVersionStatus(collector)
  checkChangelogs(collector)
  checkContextFreshness(collector)
  checkSymbolUniqueness(collector)
  checkBiome(collector)

  collector.printReport()

  if (collector.hasViolations) {
    process.exit(1)
  }
}

main()
