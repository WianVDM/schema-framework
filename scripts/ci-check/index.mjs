#!/usr/bin/env node

// NOTE: Local CI validation script that mirrors .github/workflows/ci.yml.
// Runs typecheck → build → lint sequentially, same as the CI pipeline.
// Use before pushing to catch failures early.

import { execSync } from 'node:child_process'

const TURBO_PIPELINE = ['typecheck', 'build', 'lint']

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

/**
 * NOTE: Runs a single turbo pipeline step and reports timing.
 * Returns true if the step succeeded, false otherwise.
 */
function runStep(step) {
  const label = `pnpm run ${step}`
  console.log(`\n${COLORS.cyan}${COLORS.bold}▶ Running: ${label}${COLORS.reset}`)
  const start = performance.now()

  try {
    execSync(`pnpm run ${step}`, { stdio: 'inherit', windowsHide: true })
    const elapsed = ((performance.now() - start) / 1000).toFixed(1)
    console.log(`${COLORS.green}  ✅ ${step} passed (${elapsed}s)${COLORS.reset}`)
    return true
  } catch {
    const elapsed = ((performance.now() - start) / 1000).toFixed(1)
    console.log(`${COLORS.red}  ❌ ${step} failed (${elapsed}s)${COLORS.reset}`)
    return false
  }
}

/**
 * NOTE: Main entry point. Runs all pipeline steps and exits with
 * a non-zero code if any step fails, matching CI behavior.
 */
function main() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}═══ Preflight CI Check ═══${COLORS.reset}`)
  console.log(`${COLORS.dim}Mirrors .github/workflows/ci.yml: ${TURBO_PIPELINE.join(' → ')}${COLORS.reset}`)

  const results = []

  for (const step of TURBO_PIPELINE) {
    const ok = runStep(step)
    results.push({ step, ok })
    if (!ok) break
  }

  const allPassed = results.every(r => r.ok)
  const totalSteps = results.length

  console.log(`\n${COLORS.bold}═══ Summary ═══${COLORS.reset}`)

  for (const { step, ok } of results) {
    const icon = ok ? '✅' : '❌'
    console.log(`  ${icon} ${step}`)
  }

  if (allPassed) {
    console.log(`\n${COLORS.green}${COLORS.bold}✅ All ${totalSteps}/${TURBO_PIPELINE.length} checks passed — safe to push${COLORS.reset}\n`)
    process.exit(0)
  } else {
    console.log(`\n${COLORS.red}${COLORS.bold}❌ ${totalSteps}/${TURBO_PIPELINE.length} checks passed — fix failures before pushing${COLORS.reset}\n`)
    process.exit(1)
  }
}

main()