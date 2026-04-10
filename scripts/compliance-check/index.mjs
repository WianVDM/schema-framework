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
 *
 * Output: Structured report with violations and suggestions.
 * Exit code: 0 always (violations are informational for AI, not build-blocking).
 */

import { SeverityCollector } from '../shared/output-helpers.mjs'
import { checkVersionStatus } from './check-version-status.mjs'
import { checkChangelogs } from './check-changelogs.mjs'
import { checkContextFreshness } from './check-context-freshness.mjs'
import { checkSymbolUniqueness } from './check-symbol-uniqueness.mjs'

function main() {
  console.log('\n🔍 Compliance Check Results:\n')

  const collector = new SeverityCollector()

  checkVersionStatus(collector)
  checkChangelogs(collector)
  checkContextFreshness(collector)
  checkSymbolUniqueness(collector)

  collector.printReport()
}

main()