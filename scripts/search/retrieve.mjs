// NOTE: Orchestrates context retrieval using BM25 search over .context.json files.
// NOTE: Discovers all .context.json files, runs BM25, formats results as markdown.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { bm25Search } from "./bm25.mjs";

const ROOT = resolve(import.meta.dirname, "../..");

/**
 * NOTE: Retrieves relevant context directories matching a query.
 * @param {string} query - Search query
 * @param {object} options - { maxResults?: number, maxTokens?: number }
 * @returns {{ context: string, sources: string[], tokenEstimate: number }}
 */
export function retrieveContext(query, options = {}) {
	const { maxResults = 5, maxTokens = 500 } = options;
	const contextFiles = discoverContextFiles(ROOT);
	const documents = contextFiles.map((p) => ({
		path: relative(ROOT, dirname(p)),
		content: readFileContent(p),
	}));

	const results = bm25Search(query, documents, { maxResults });
	const lines = [];

	for (const result of results) {
		lines.push(`## ${result.directory} (score: ${result.score})`);
		lines.push(`> Terms: ${result.matchedTerms.join(", ")}`);
		lines.push(`> ${result.snippet.slice(0, 150)}...`);
		lines.push("");
	}

	const context = lines.join("\n");
	const tokenEstimate = Math.ceil(context.length / 4);

	return {
		context:
			tokenEstimate > maxTokens ? context.slice(0, maxTokens * 4) : context,
		sources: results.map((r) => r.directory),
		tokenEstimate: Math.min(tokenEstimate, maxTokens),
	};
}

function discoverContextFiles(dir) {
	const results = [];
	const skipDirs = new Set(["node_modules", ".git", "dist", ".next", ".ai"]);

	try {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory() && !skipDirs.has(entry.name)) {
				results.push(...discoverContextFiles(fullPath));
			} else if (entry.name === ".context.json") {
				results.push(fullPath);
			}
		}
	} catch {
		// NOTE: Permission denied or other fs errors — skip silently
	}

	return results;
}

function readFileContent(path) {
	try {
		return readFileSync(path, "utf-8");
	} catch (err) {
		// NOTE: Skip unreadable context files — search operates on best-effort basis
		console.error(`WARN: Could not read ${path}: ${err.message}`);
		return "";
	}
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("retrieve.mjs")) {
	const query = process.argv.slice(2).join(" ");
	if (!query) {
		console.error("Usage: node scripts/search/retrieve.mjs <query>");
		process.exit(1);
	}
	const result = retrieveContext(query);
	console.log(result.context);
	console.error(
		`\n--- ${result.tokenEstimate} tokens, ${result.sources.length} sources ---`,
	);
}
