// NOTE: Token budget enforcement for the AI memory store.
// NOTE: Hard cap: 750 tokens (~3000 characters). Enforced at every write.
// NOTE: Consumed by save.mjs, compact.mjs, and wake-up.mjs.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const MEMORY_TOKEN_BUDGET = 750;
const CHARS_PER_TOKEN = 4;

/**
 * NOTE: Estimates token count for a text string (rough: chars / CHARS_PER_TOKEN).
 */
export function estimateTokens(text) {
	return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * NOTE: Checks whether a serialized JSON string is within the memory token budget.
 * Returns { withinBudget, currentTokens, maxTokens, overBy }.
 */
export function checkBudget(serializedJson) {
	const currentTokens = estimateTokens(serializedJson);
	return {
		withinBudget: currentTokens <= MEMORY_TOKEN_BUDGET,
		currentTokens,
		maxTokens: MEMORY_TOKEN_BUDGET,
		overBy: Math.max(0, currentTokens - MEMORY_TOKEN_BUDGET),
	};
}

/**
 * NOTE: Trims a parsed store object to fit within the token budget.
 * Removes oldest sessions first, then trims keyPatterns if still over budget.
 * Returns the trimmed store object (does NOT write to disk).
 */
export function trimToBudget(store) {
	let serialized = JSON.stringify(store);
	let budget = checkBudget(serialized);

	if (budget.withinBudget) return store;

	// NOTE: Phase 1 — remove oldest sessions until within budget or no sessions left
	while (!budget.withinBudget && store.sessions && store.sessions.length > 1) {
		store.sessions.shift();
		serialized = JSON.stringify(store);
		budget = checkBudget(serialized);
	}

	// NOTE: Phase 2 — trim keyPatterns if still over budget
	if (!budget.withinBudget && store.project?.keyPatterns) {
		while (!budget.withinBudget && store.project.keyPatterns.length > 0) {
			store.project.keyPatterns.pop();
			serialized = JSON.stringify(store);
			budget = checkBudget(serialized);
		}
	}

	return store;
}

/**
 * NOTE: Loads and checks the memory store budget from disk.
 * Returns { store, budget } where budget is the BudgetCheck result.
 * Returns null if the store file doesn't exist.
 */
export function loadAndCheckBudget(memoryDir) {
	const storePath = join(memoryDir, "store.json");
	try {
		const raw = readFileSync(storePath, "utf-8");
		const store = JSON.parse(raw);
		const budget = checkBudget(raw);
		return { store, budget };
	} catch {
		return null;
	}
}

export { CHARS_PER_TOKEN, MEMORY_TOKEN_BUDGET };
