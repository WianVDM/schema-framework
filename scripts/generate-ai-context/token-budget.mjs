// NOTE: Token budget estimation and validation for AI context files.
// NOTE: Loads budget configuration from docs/ai/token-budgets.json.

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ROOT } from './constants.mjs'

// NOTE: Default budgets used when token-budgets.json is missing or invalid.
const DEFAULT_BUDGETS = {
  'system.md': { maxTokens: 800, maxLines: 80 },
  'context.json': { maxTokens: 2500, maxLines: 280 },
  'symbol-index-manifest.json': { maxTokens: 200, maxLines: 20 },
  'symbol-index-layer1.json': { maxTokens: 500, maxLines: 60 },
  'symbol-index-layer2.json': { maxTokens: 5000, maxLines: 450 },
  'symbol-index-layer3.json': { maxTokens: 2000, maxLines: 200 },
  'impact-graph.json': { maxTokens: 2000, maxLines: 200 },
  'directory-index.json': { maxTokens: 500, maxLines: 50 },
}

/**
 * NOTE: Estimates the number of tokens in a text string.
 * Uses ~3 chars/token for JSON, ~4 chars/token for prose.
 */
export function estimateTokens(text, isJson = false) {
  return Math.ceil(text.length / (isJson ? 3 : 4))
}

/**
 * NOTE: Loads token budget configuration from docs/ai/token-budgets.json.
 * Falls back to DEFAULT_BUDGETS if the file is missing or invalid.
 */
export function loadBudgets() {
  const budgetPath = join(ROOT, 'docs', 'ai', 'token-budgets.json')
  if (!existsSync(budgetPath)) {
    console.warn('WARNING: docs/ai/token-budgets.json not found — using defaults')
    return DEFAULT_BUDGETS
  }
  try {
    const raw = JSON.parse(readFileSync(budgetPath, 'utf-8'))
    return raw.budgets || DEFAULT_BUDGETS
  } catch (err) {
    console.warn(`WARNING: Failed to load token-budgets.json: ${err.message}`)
    return DEFAULT_BUDGETS
  }
}

/**
 * NOTE: Validates a file's content against its token and line budgets.
 * Returns an array of warning strings if budgets are exceeded, or null if OK.
 */
export function validateTokenBudget(filePath, content, budgets) {
  let matched = null
  for (const [suffix, budget] of Object.entries(budgets)) {
    if (filePath.endsWith(suffix)) { matched = budget; break }
  }
  if (!matched) return null

  const tokens = estimateTokens(content, true)
  const lines = content.split('\n').length
  const warnings = []

  if (tokens > matched.maxTokens) {
    warnings.push(`Token budget exceeded: ${tokens} > ${matched.maxTokens}`)
  }
  if (lines > matched.maxLines) {
    warnings.push(`Line budget exceeded: ${lines} > ${matched.maxLines}`)
  }
  return warnings.length > 0 ? warnings : null
}