// NOTE: Query decision triples from the knowledge graph.
// NOTE: Supports filtering by subject, predicate, object, and active-only status.

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const DECISIONS_PATH = join(ROOT, ".ai", "memory", "decisions.json");

/**
 * NOTE: Query triples from the knowledge graph with optional filters.
 * @param {object} filters - { subject?, predicate?, object?, activeOnly? }
 * @returns {{ matches: object[], activeOnly: boolean }}
 */
export function queryTriples(filters = {}) {
	const { subject, predicate, object: obj, activeOnly = true } = filters;
	const data = loadDecisions();
	let triples = data.triples || [];

	if (activeOnly) {
		triples = triples.filter((t) => t.validTo === null);
	}
	if (subject) {
		triples = triples.filter((t) =>
			t.subject.toLowerCase().includes(subject.toLowerCase()),
		);
	}
	if (predicate) {
		triples = triples.filter((t) =>
			t.predicate.toLowerCase().includes(predicate.toLowerCase()),
		);
	}
	if (obj) {
		triples = triples.filter((t) =>
			t.object.toLowerCase().includes(obj.toLowerCase()),
		);
	}

	return { matches: triples, activeOnly };
}

function loadDecisions() {
	try {
		return JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
	} catch {
		return { version: 1, triples: [] };
	}
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("query.mjs")) {
	const args = process.argv.slice(2);
	const filters = { activeOnly: true };
	for (const arg of args) {
		const [key, val] = arg.split("=");
		if (key === "--subject") filters.subject = val;
		if (key === "--predicate") filters.predicate = val;
		if (key === "--object") filters.object = val;
		if (key === "--all") filters.activeOnly = false;
	}
	const result = queryTriples(filters);
	console.log(JSON.stringify(result, null, 2));
}
