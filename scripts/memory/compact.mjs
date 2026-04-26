// NOTE: Saves working context before context window compression.
// NOTE: Compacts the memory store to retain essential context within token budget.
// NOTE: Collects git state (changed files, branch) and updates store.json deterministically.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { trimToBudget } from "./budget.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const STORE_PATH = join(ROOT, ".ai", "memory", "store.json");

/**
 * NOTE: Saves working state to the memory store before context compression.
 * @param {string[]} _workspaceRoots - Workspace root paths
 * @returns {{ cancel: false, contextModification: string }}
 */
export function compact(_workspaceRoots) {
	const changedFiles = getChangedFiles();
	const branch = getCurrentBranch();
	let store = loadStore();

	// NOTE: Update activeMilestone with current branch info
	if (!store.activeMilestone) {
		store.activeMilestone = {};
	}
	store.activeMilestone.lastUpdated = new Date().toISOString().split("T")[0];

	// NOTE: Append compression note to latest session
	if (store.sessions?.length > 0) {
		const latest = store.sessions[store.sessions.length - 1];
		const note = `Context compressed mid-task. Branch: ${branch}. Changed: ${changedFiles.slice(0, 5).join(", ")}${changedFiles.length > 5 ? ` (+${changedFiles.length - 5} more)` : ""}`;
		latest.summary = `${latest.summary} [${note}]`;
	}

	store = trimToBudget(store);
	writeStore(store);

	return {
		cancel: false,
		contextModification:
			"✦ Memory saved before context compression. No action needed.",
	};
}

function getChangedFiles() {
	try {
		const output = execSync("git diff --name-only", {
			cwd: ROOT,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		return output.trim().split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

function getCurrentBranch() {
	try {
		return execSync("git branch --show-current", {
			cwd: ROOT,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		return "unknown";
	}
}

function loadStore() {
	try {
		return JSON.parse(readFileSync(STORE_PATH, "utf-8"));
	} catch {
		return { version: 1, project: {}, sessions: [] };
	}
}

function writeStore(store) {
	writeFileSync(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("compact.mjs")) {
	const result = compact(["."]);
	console.log(JSON.stringify(result, null, 2));
}
