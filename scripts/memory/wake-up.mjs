// NOTE: Loads memory store for session start. Returns formatted context string.
// NOTE: Loads and formats memory store on first tool call of a new session.
// NOTE: Output: ~750 tokens max, formatted as markdown for AI context injection.

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { estimateTokens } from "./budget.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const STORE_PATH = join(ROOT, ".ai", "memory", "store.json");

/**
 * NOTE: Loads and formats the memory store as a markdown context block.
 * @param {string[]} _workspaceRoots - Workspace root paths (unused, reserved for interface consistency)
 * @returns {{ context: string, tokenEstimate: number }}
 */
export function wakeUp(_workspaceRoots) {
	const store = loadStore();
	const lines = [];

	lines.push("## Project Memory");

	// NOTE: Project philosophy and architecture
	if (store.project) {
		if (store.project.philosophy) {
			lines.push(`- **Philosophy**: ${store.project.philosophy}`);
		}
		if (store.project.architecture) {
			lines.push(`- **Architecture**: ${store.project.architecture}`);
		}
		if (store.project.keyPatterns?.length > 0) {
			lines.push("- **Key Patterns**:");
			for (const pattern of store.project.keyPatterns.slice(0, 10)) {
				lines.push(`  - ${pattern}`);
			}
		}
	}

	// NOTE: Active milestone
	if (store.activeMilestone) {
		const m = store.activeMilestone;
		lines.push(
			`- **Active Milestone**: v${m.version || "?"} — ${m.milestone || "?"} (${m.status || "?"})`,
		);
		if (m.currentSlice) {
			lines.push(`  - Current: ${m.currentSlice}`);
		}
	}

	// NOTE: Last session summary (most recent only)
	if (store.sessions?.length > 0) {
		const last = store.sessions[store.sessions.length - 1];
		lines.push(`- **Last Session** (${last.date}): ${last.summary}`);
		if (last.decisions?.length > 0) {
			lines.push("  - Decisions:");
			for (const dec of last.decisions) {
				lines.push(`    - ${dec}`);
			}
		}
		if (last.nextSteps?.length > 0) {
			lines.push("  - Next Steps:");
			for (const step of last.nextSteps) {
				lines.push(`    - ${step}`);
			}
		}
	}

	// NOTE: Preferences
	if (store.preferences) {
		const prefs = store.preferences;
		if (prefs.codingStyle) {
			lines.push(`- **Coding Style**: ${prefs.codingStyle}`);
		}
		if (prefs.testingStrategy) {
			lines.push(`- **Testing**: ${prefs.testingStrategy}`);
		}
	}

	const context = lines.join("\n");
	const tokenEstimate = estimateTokens(context);

	return { context, tokenEstimate: Math.min(tokenEstimate, 750) };
}

function loadStore() {
	try {
		return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
	} catch {
		return {
			project: {
				name: "Schema Framework",
				philosophy: "Token-efficient structured context.",
				architecture: "Layered architecture",
			},
			sessions: [],
		};
	}
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("wake-up.mjs")) {
	const result = wakeUp(["."]);
	console.log(result.context);
	console.error(`\n--- ${result.tokenEstimate} tokens ---`);
}
