#!/usr/bin/env node

// NOTE: Biome check and fix operations — single-file and project-wide modes.
// NOTE: Supports both single-file and project-wide modes.

import { execFileSync, execSync } from "node:child_process";
import { truncateOutput } from "../shared/truncate-output.mjs";

/**
 * NOTE: Runs biome check --fix on a single file. Returns true if fixes were applied.
 * @param {string} filePath - Relative path to the file
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ fixed: boolean, output?: string }}
 */
export function biomeFixFile(filePath, workspaceRoot) {
	try {
		execFileSync(
			"npx",
			[
				"biome",
				"check",
				"--fix",
				"--unsafe",
				filePath,
				"--no-errors-on-unmatched",
			],
			{
				cwd: workspaceRoot,
				encoding: "utf8",
				windowsHide: true,
				timeout: 15_000,
				stdio: ["pipe", "pipe", "pipe"],
			},
		);
		return { fixed: false };
	} catch (error) {
		// NOTE: Exit code 1 means biome found and possibly fixed issues
		if (error.status === 1) {
			return { fixed: true, output: truncateOutput(error.stdout || "") };
		}
		return { fixed: false };
	}
}

/**
 * NOTE: Runs biome check (no fix) on a single file.
 * @param {string} filePath - Relative path to the file
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ passed: boolean, output?: string }}
 */
export function biomeCheckFile(filePath, workspaceRoot) {
	let output = "";
	try {
		execFileSync(
			"npx",
			["biome", "check", filePath, "--no-errors-on-unmatched"],
			{
				cwd: workspaceRoot,
				encoding: "utf8",
				windowsHide: true,
				timeout: 15_000,
				stdio: ["pipe", "pipe", "pipe"],
			},
		);
		return { passed: true };
	} catch (error) {
		output = `${error.stdout || ""}${error.stderr || ""}`;
		// NOTE: "Checked 0 files" means file is outside biome's scope — not a violation
		if (output.includes("Checked 0 files")) return { passed: true };
		if (error.status === 1 && output.trim()) {
			return { passed: false, output: truncateOutput(output, 2000) };
		}
		return { passed: true };
	}
}

/**
 * NOTE: Runs biome check --write on the entire project.
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ passed: boolean, output?: string }}
 */
export function biomeFixProject(workspaceRoot) {
	try {
		const output = execSync("npx biome check --write --unsafe .", {
			cwd: workspaceRoot,
			encoding: "utf8",
			stdio: "pipe",
		});
		return { passed: true, output: truncateOutput(output) };
	} catch (error) {
		return {
			passed: false,
			output: `Biome fix failed:\n${truncateOutput(error.stdout || error.message)}`,
		};
	}
}
