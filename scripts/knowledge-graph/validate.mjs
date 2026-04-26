// NOTE: Contradiction detection against the knowledge graph.
// NOTE: Compares proposed claims against stored triples to find conflicts.

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const DECISIONS_PATH = join(ROOT, ".ai", "memory", "decisions.json");

/**
 * NOTE: Checks claims against stored triples for contradictions.
 * @param {Array<{ subject: string, predicate: string, object: string }>} claims
 * @returns {Array<{ type: string, existing: object, proposed: object, explanation: string }>}
 */
export function checkContradictions(claims) {
	const data = loadDecisions();
	const activeTriples = (data.triples || []).filter((t) => t.validTo === null);
	const contradictions = [];

	for (const claim of claims) {
		for (const triple of activeTriples) {
			const contradiction = findContradiction(triple, claim);
			if (contradiction) contradictions.push(contradiction);
		}
	}

	return contradictions;
}

function findContradiction(existing, proposed) {
	// NOTE: Same subject + predicate but different object = relationship mismatch
	if (
		existing.subject.toLowerCase() === proposed.subject.toLowerCase() &&
		existing.predicate.toLowerCase() === proposed.predicate.toLowerCase() &&
		existing.object.toLowerCase() !== proposed.object.toLowerCase()
	) {
		return {
			type: "relationship_mismatch",
			existing,
			proposed,
			explanation: `Active decision: "${existing.subject}" ${existing.predicate} "${existing.object}" — contradicts proposed: "${proposed.subject}" ${proposed.predicate} "${proposed.object}"`,
		};
	}
	return null;
}

function loadDecisions() {
	try {
		return JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
	} catch {
		return { version: 1, triples: [] };
	}
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("validate.mjs")) {
	const args = process.argv.slice(2);
	const claims = [];
	for (const arg of args) {
		if (arg.startsWith("--claim=")) {
			const parts = arg.slice(8).split("|");
			if (parts.length === 3) {
				claims.push({
					subject: parts[0],
					predicate: parts[1],
					object: parts[2],
				});
			}
		}
	}
	const result = checkContradictions(claims);
	console.log(JSON.stringify(result, null, 2));
}
