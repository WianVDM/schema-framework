#!/usr/bin/env node

// NOTE: Single-file context update for targeted .context.json directory updates.
// NOTE: Wraps generate-ai-context for targeted .context.json single-directory updates.
// NOTE: Full regeneration should use scripts/generate-ai-context/index.mjs directly.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { options } from "../generate-ai-context/constants.mjs";
import { buildContextForDir } from "../generate-ai-context/context-builder.mjs";

/**
 * NOTE: Updates the .context.json entry for a single file's directory.
 * Uses the existing generate-ai-context system for structural metadata (exports, types, deps).
 * Preserves manually-written descriptions (non-TODO).
 *
 * @param {string} filePath - Relative path to the file that was edited
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ updated: boolean, todos: string[], warnings: string[] }}
 */
export function updateContextForFile(filePath, workspaceRoot) {
	// NOTE: Set options for single-directory mode (no deep scan, no diff)
	options.deep = false;
	options.governance = true;
	options.force = true;

	const dirPath = dirname(filePath);
	const fileName = filePath.split("/").pop().split("\\").pop();

	try {
		// NOTE: Build fresh context for the directory using the existing system
		const result = buildContextForDir(dirPath);
		if (!result) return { updated: false, todos: [], warnings: [] };

		const { context: newContext } = result;
		const contextPath = join(resolve(workspaceRoot, dirPath), ".context.json");

		// NOTE: Collect TODOs from the new file entry
		const todos = [];
		const warnings = [];
		const fileEntry = newContext.files?.[fileName];

		if (fileEntry?.desc?.startsWith("TODO:")) {
			todos.push(`${dirPath}/.context.json → ${fileName}: ${fileEntry.desc}`);
		}

		// NOTE: Also check for other files in the directory that have TODO descriptions
		for (const [name, entry] of Object.entries(newContext.files || {})) {
			if (entry?.desc?.startsWith("TODO:") && name !== fileName) {
				warnings.push(
					`Existing TODO in ${dirPath}/.context.json → ${name}: ${entry.desc}`,
				);
			}
		}

		// NOTE: Write the updated context file
		const content = `${JSON.stringify(newContext, null, 2)}\n`;
		writeFileSync(contextPath, content, "utf-8");

		return { updated: true, todos, warnings };
	} catch {
		// NOTE: Context generation failure should not block — return gracefully
		return {
			updated: false,
			todos: [],
			warnings: [`Could not update context for ${dirPath}`],
		};
	}
}

/**
 * NOTE: Checks if a .context.json exists for a directory.
 * @param {string} dirPath - Relative directory path
 * @param {string} workspaceRoot - Project root directory
 * @returns {boolean}
 */
export function contextExistsForDir(dirPath, workspaceRoot) {
	const contextPath = join(resolve(workspaceRoot, dirPath), ".context.json");
	return existsSync(contextPath);
}

/**
 * NOTE: Reads the .context.json for a directory and collects all TODO entries.
 * @param {string} dirPath - Relative directory path
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ todos: string[], fresh: boolean }}
 */
export function collectContextTodos(dirPath, workspaceRoot) {
	const contextPath = join(resolve(workspaceRoot, dirPath), ".context.json");
	if (!existsSync(contextPath)) return { todos: [], fresh: true };

	try {
		const raw = readFileSync(contextPath, "utf-8");
		const context = JSON.parse(raw);
		const todos = [];

		// NOTE: Check purpose field
		if (context.purpose === "" || context.purpose?.startsWith("TODO:")) {
			todos.push(`${dirPath}/.context.json → purpose needs description`);
		}

		// NOTE: Check each file entry
		for (const [name, entry] of Object.entries(context.files || {})) {
			if (entry?.desc?.startsWith("TODO:")) {
				todos.push(`${dirPath}/.context.json → ${name}: ${entry.desc}`);
			}
		}

		return { todos, fresh: todos.length === 0 };
	} catch {
		return { todos: [], fresh: true };
	}
}
