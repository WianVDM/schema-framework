// NOTE: Shared output formatting utilities for all script subsystems.
// NOTE: SeverityCollector extracted from compliance-check.mjs inline arrays and print logic.

/**
 * NOTE: Collects violations, warnings, and suggestions, then prints a structured report.
 * Replaces the inline arrays and print logic previously in compliance-check.mjs.
 */
export class SeverityCollector {
  constructor() {
    this._violations = []
    this._warnings = []
    this._suggestions = []
  }

  addViolation(msg) { this._violations.push(msg) }
  addWarning(msg) { this._warnings.push(msg) }
  addSuggestion(msg) { this._suggestions.push(msg) }

  get hasIssues() {
    return this._violations.length > 0 || this._warnings.length > 0 || this._suggestions.length > 0
  }

  printReport() {
    if (!this.hasIssues) {
      console.log('  ✅ All checks passed — no violations or suggestions\n')
      return
    }

    if (this._violations.length > 0) {
      console.log('  ❌ Violations:')
      for (const v of this._violations) console.log(`     ${v}`)
      console.log()
    }

    if (this._warnings.length > 0) {
      console.log('  ⚠️  Warnings:')
      for (const w of this._warnings) console.log(`     ${w}`)
      console.log()
    }

    if (this._suggestions.length > 0) {
      console.log('  📝 Descriptions needed (AI should review):')
      for (const s of this._suggestions) console.log(`     ${s}`)
      console.log()
    }

    console.log(`  Summary: ${this._violations.length} violations, ${this._warnings.length} warnings, ${this._suggestions.length} suggestions\n`)
  }
}