#!/usr/bin/env node

// NOTE: Changeset check — verifies changeset exists when core package files change.
// NOTE: Auto-generates descriptive changesets using diff analysis and symbol extraction
// NOTE: via the full auto-changeset generator (not a generic stub).

import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
	generateChangeset,
	writeChangeset,
} from "../auto-changeset/changeset-writer.mjs";
import {
	getChangedCoreFiles,
	getFileDiff,
} from "../auto-changeset/git-operations.mjs";
import { resolveBumpLevel } from "../auto-changeset/version-bump.mjs";
import { ROOT } from "../shared/constants.mjs";
import { readPackageJson } from "../shared/file-helpers.mjs";

/**
 * NOTE: Reads the package name from packages/core/package.json.
 * Falls back to 'schema-framework' if unreadable.
 */
function getCorePackageName() {
	const corePkgPath = join(ROOT, "packages", "core", "package.json");
	const pkg = readPackageJson(corePkgPath);
	return pkg ? pkg.name : "schema-framework";
}

/**
 * NOTE: Checks if a changeset is required and exists.
 * Auto-generates a descriptive changeset using full diff analysis when needed.
 * @param {string} workspaceRoot - Project root directory
 * @param {{ scope?: string, extensions?: string }} config - Scope and extension filters
 * @returns {{ passed: boolean, output?: string }}
 */
export function checkChangeset(workspaceRoot, _config = {}) {
	const changedCoreFiles = getChangedCoreFiles();

	if (changedCoreFiles.length === 0) {
		return { passed: true };
	}

	const changesetDir = join(workspaceRoot, ".changeset");

	if (!existsSync(changesetDir)) {
		// NOTE: Attempt to create directory and generate changeset
		return tryAutoGenerate(changesetDir, changedCoreFiles);
	}

	const existingChangesets = readdirSync(changesetDir).filter(
		(f) => f.endsWith(".md") && f !== "README.md" && f !== "config.json",
	);

	if (existingChangesets.length > 0) {
		return { passed: true };
	}

	return tryAutoGenerate(changesetDir, changedCoreFiles);
}

/**
 * NOTE: Generates a descriptive changeset file using the full auto-changeset generator.
 * Produces diff-analyzed content with per-file bullet points, change verbs, and affected symbols.
 * @param {string} changesetDir - Path to .changeset/ directory
 * @param {string[]} coreFiles - List of changed core source files
 * @returns {{ passed: boolean, output?: string }}
 */
function tryAutoGenerate(changesetDir, coreFiles) {
	try {
		if (!existsSync(changesetDir)) {
			mkdirSync(changesetDir, { recursive: true });
		}

		const packageName = getCorePackageName();
		const versionInfo = resolveBumpLevel();
		const bump = versionInfo?.bump ?? "patch";

		const { filename, content } = generateChangeset(
			coreFiles,
			packageName,
			{ getFileDiff },
			{ bump },
		);

		const filePath = join(changesetDir, filename);
		if (writeChangeset(filePath, content)) {
			return {
				passed: true,
				output: `Auto-generated descriptive changeset: .changeset/${filename}`,
			};
		}

		return {
			passed: false,
			output:
				"Changeset required: failed to write auto-generated changeset. Run `pnpm changeset` to create one manually.",
		};
	} catch {
		return {
			passed: false,
			output:
				"Changeset required: packages/core/src/ files changed. Run `pnpm changeset` to create one.",
		};
	}
}
