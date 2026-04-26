#!/usr/bin/env node

// NOTE: TypeScript type check — runs pnpm typecheck and reports results.

import { execSync } from "node:child_process";
import { truncateOutput } from "../shared/truncate-output.mjs";

/**
 * NOTE: Runs TypeScript type check across all packages.
 * @param {string} workspaceRoot - Project root directory
 * @param {string} [cmd="pnpm typecheck"] - Typecheck command to run
 * @returns {{ passed: boolean, output?: string }}
 */
export function typecheck(workspaceRoot, cmd = "pnpm typecheck") {
	try {
		const output = execSync(cmd, {
			cwd: workspaceRoot,
			encoding: "utf8",
			stdio: "pipe",
		});
		return { passed: true, output: truncateOutput(output) };
	} catch (error) {
		return {
			passed: false,
			output: `Type check failed:\n${truncateOutput(error.stdout || error.message)}`,
		};
	}
}
