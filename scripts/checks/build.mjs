#!/usr/bin/env node

// NOTE: Project build — runs pnpm build and reports results.

import { execSync } from "node:child_process";
import { truncateOutput } from "../shared/truncate-output.mjs";

/**
 * NOTE: Runs pnpm build.
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ passed: boolean, output?: string }}
 */
export function build(workspaceRoot) {
	try {
		const output = execSync("pnpm build", {
			cwd: workspaceRoot,
			encoding: "utf8",
			stdio: "pipe",
		});
		return { passed: true, output: truncateOutput(output) };
	} catch (error) {
		return {
			passed: false,
			output: `Build failed:\n${truncateOutput(error.stdout || error.message)}`,
		};
	}
}
