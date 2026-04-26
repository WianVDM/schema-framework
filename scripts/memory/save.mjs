// NOTE: Saves session context to the AI memory store.
// NOTE: Called by hooks (TaskComplete) or CLI: node scripts/memory/save.mjs
// NOTE: Input via stdin JSON or CLI args. Enforces 750-token budget.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkBudget, trimToBudget } from "./budget.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const STORE_PATH = join(ROOT, ".ai", "memory", "store.json");

const MAX_SESSIONS = 5;
const MAX_DECISIONS = 5;
const MAX_NEXT_STEPS = 5;

/**
 * NOTE: Saves a session summary to the memory store.
 * @param {object} input - { summary: string, decisions?: string[], nextSteps?: string[] }
 * @returns {{ success: boolean, tokensUsed: number, message: string }}
 */
export function saveSession(input) {
	const { summary = "", decisions = [], nextSteps = [] } = input;

	if (!summary.trim()) {
		return { success: false, tokensUsed: 0, message: "No summary provided" };
	}

	let store = loadStore();
	const sessionId = buildSessionId();

	const session = {
		id: sessionId,
		date: new Date().toISOString().split("T")[0],
		summary: summary.slice(0, 300),
		decisions: decisions
			.slice(0, MAX_DECISIONS)
			.map((d) => String(d).slice(0, 150)),
		nextSteps: nextSteps
			.slice(0, MAX_NEXT_STEPS)
			.map((s) => String(s).slice(0, 100)),
	};

	store.sessions = store.sessions || [];
	store.sessions.push(session);

	// NOTE: Trim oldest sessions if over max
	while (store.sessions.length > MAX_SESSIONS) {
		const oldest = store.sessions.shift();
		// NOTE: Summarize oldest into keyPatterns if it had decisions
		if (oldest?.decisions?.length && store.project?.keyPatterns) {
			for (const dec of oldest.decisions) {
				if (store.project.keyPatterns.length < 10) {
					store.project.keyPatterns.push(dec);
				}
			}
		}
	}

	// NOTE: Enforce token budget
	store = trimToBudget(store);

	writeStore(store);
	const serialized = JSON.stringify(store);
	const budget = checkBudget(serialized);

	return {
		success: true,
		tokensUsed: budget.currentTokens,
		message: `Session saved (${budget.currentTokens}/${budget.maxTokens} tokens)`,
	};
}

function loadStore() {
	try {
		return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
	} catch {
		return {
			version: 1,
			project: {
				name: "Schema Framework",
				philosophy:
					"Token-efficient structured context. Pre-computed over retrieved. Constraint over memory.",
				architecture:
					"Layered: Layer 0 (types) → Layer 1 (primitives) → Layer 2 (engine) → Layer 3 (composition)",
				keyPatterns: [],
			},
			sessions: [],
		};
	}
}

function writeStore(store) {
	writeFileSync(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

function buildSessionId() {
	const date = new Date();
	const dateStr = date.toISOString().split("T")[0];
	const timeStr = date.toTimeString().slice(0, 2);
	return `${dateStr}-${timeStr}`;
}

// NOTE: CLI entry point — reads input from stdin or CLI args
if (process.argv[1]?.includes("save.mjs")) {
	const input = {
		summary: process.argv[2] || "",
		decisions: [],
		nextSteps: [],
	};
	const result = saveSession(input);
	console.log(JSON.stringify(result, null, 2));
}
