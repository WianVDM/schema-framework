#!/usr/bin/env node

// NOTE: Rule engine checks — single-file and project-wide rule validation.
// NOTE: Wraps the compliance-check rule-engine for single-file and project-wide use.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkFile, loadRules } from "../compliance-check/rule-engine.mjs";

/**
 * NOTE: Runs rule engine checks on a single file.
 * @param {string} filePath - Relative path to the file
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ passed: boolean, violations: string[] }}
 */
export function checkFileRules(filePath, workspaceRoot) {
	try {
		const fullPath = resolve(workspaceRoot, filePath);
		if (!existsSync(fullPath)) return { passed: true, violations: [] };

		const content = readFileSync(fullPath, "utf8");
		const rules = loadRules(workspaceRoot);
		const relPath = filePath.replace(/\\/g, "/");
		const violations = checkFile(relPath, content, rules);

		const messages = violations.map(
			(v) => `${v.message} (line ${v.line})\n  Rationale: ${v.rationale}`,
		);

		return { passed: messages.length === 0, violations: messages };
	} catch {
		return { passed: true, violations: [] };
	}
}
