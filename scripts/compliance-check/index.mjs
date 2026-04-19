// NOTE: Compliance orchestrator — runs all checks and reports results.
// NOTE: Used by `pnpm compliance` and by TaskComplete hook.

import { ROOT } from '../shared/constants.mjs'
import { logTrace, SeverityCollector } from '../shared/output-helpers.mjs'
import { checkProject as runBiomeCheck } from './biome-runner.mjs'
import { checkChangelogs } from './checks/changelogs.mjs'
import { checkContextFreshness } from './checks/context-freshness.mjs'
import { checkContextGovernance } from './checks/context-governance.mjs'
import { checkSymbolUniqueness } from './checks/symbol-uniqueness.mjs'
import { checkVersionStatus } from './checks/version-status.mjs'
import { checkProject, loadRules } from './rule-engine.mjs'

const SCRIPT = 'compliance'
const collector = new SeverityCollector()

logTrace(SCRIPT, 'Starting compliance checks...')

// NOTE: Phase 1 — Rule engine checks (regex patterns from .clinerules/workspace-*.json)
logTrace(SCRIPT, 'Phase 1: Loading rules from .clinerules/...')
const rules = loadRules(ROOT)
logTrace(SCRIPT, `  Loaded ${rules.length} rules`)

if (rules.length > 0) {
  logTrace(SCRIPT, 'Phase 1b: Running rule checks against all source files...')
  const violations = checkProject(ROOT, rules)
  for (const v of violations) {
    collector.addViolation(`[${v.id}] ${v.file}:${v.line} — ${v.message}`)
  }
  logTrace(SCRIPT, `  Found ${violations.length} rule violations`)
}

// NOTE: Phase 2 — Biome checks
logTrace(SCRIPT, 'Phase 2: Running biome check...')
const biomeResult = runBiomeCheck(ROOT)
for (const error of biomeResult.errors) {
  collector.addViolation(`[biome] ${error}`)
}
for (const warning of biomeResult.warnings) {
  // NOTE: Treat biome warnings as violations — they should fail compliance
  collector.addViolation(`[biome] ${warning}`)
}
logTrace(
  SCRIPT,
  `  Biome: ${biomeResult.errors.length} errors, ${biomeResult.warnings.length} warnings`,
)

// NOTE: Phase 3 — Project health checks
logTrace(SCRIPT, 'Phase 3: Running project health checks...')
checkContextFreshness(collector)
checkContextGovernance(collector)
checkChangelogs(collector)
checkVersionStatus(collector)
checkSymbolUniqueness(collector)

// NOTE: Phase 4 — Report results
logTrace(SCRIPT, 'Phase 4: Reporting results...')
collector.printReport()

if (collector.hasViolations) {
  console.error('✗ Compliance FAILED — violations must be fixed')
  process.exit(1)
} else {
  console.log('✓ Compliance PASSED')
  process.exit(0)
}
