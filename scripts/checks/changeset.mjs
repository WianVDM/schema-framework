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
import { readPackageJson } from "../shared/file-helpers.mjs";

/**
 * NOTE: Reads the package name from packages/core/package.json.
 * Falls back to 'schema-framework' if unreadable.
 * @param {string} workspaceRoot - Project root directory
 */
function getCorePackageName(workspaceRoot) {
	const corePkgPath = join(workspaceRoot, "packages", "core", "package.json");
	const pkg = readPackageJson(corePkgPath);
	return pkg ? pkg.name : "schema-framework";
}

/**
 * NOTE: Checks if a changeset is required and exists.
 * Auto-generates a descriptive changeset using full diff analysis when needed.
 * @param {string} workspaceRoot - Project root directory
 * @param {{}} _config - Unused placeholder for backwards compatibility
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
		return tryAutoGenerate(changesetDir, changedCoreFiles, workspaceRoot);
	}

	const existingChangesets = readdirSync(changesetDir).filter(
		(f) => f.endsWith(".md") && f !== "README.md" && f !== "config.json",
	);

	if (existingChangesets.length > 0) {
		return { passed: true };
	}

	return tryAutoGenerate(changesetDir, changedCoreFiles, workspaceRoot);
}

/**
 * NOTE: Generates a descriptive changeset file using the full auto-changeset generator.
 * Produces diff-analyzed content with per-file bullet points, change verbs, and affected symbols.
 * @param {string} changesetDir - Path to .changeset/ directory
 * @param {string[]} coreFiles - List of changed core source files
 * @param {string} workspaceRoot - Project root directory
 * @returns {{ passed: boolean, output?: string }}
 */
function tryAutoGenerate(changesetDir, coreFiles, workspaceRoot) {
	// NOTE: mkdirSync with recursive:true is a no-op when directory already exists — no existsSync guard needed
	try {
		mkdirSync(changesetDir, { recursive: true });
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		return {
			passed: false,
			output: `Changeset required: failed to create .changeset directory (${detail}). Run \`pnpm changeset\` to create one manually.`,
		};
	}

	let packageName;
	try {
		packageName = getCorePackageName(workspaceRoot);
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		return {
			passed: false,
			output: `Changeset required: failed to read package name (${detail}). Run \`pnpm changeset\` to create one manually.`,
		};
	}

	let bump = "patch";
	try {
		const versionInfo = resolveBumpLevel();
		bump = versionInfo?.bump ?? "patch";
	} catch (_err) {
		// NOTE: resolveBumpLevel failure is non-fatal — fall back to "patch"
	}

	let filename;
	let content;
	try {
		({ filename, content } = generateChangeset(
			coreFiles,
			packageName,
			{ getFileDiff },
			{ bump },
		));
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		return {
			passed: false,
			output: `Changeset required: failed to generate changeset content (${detail}). Run \`pnpm changeset\` to create one manually.`,
		};
	}

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
}
