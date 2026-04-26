// NOTE: Add, invalidate, or retract decision triples in the knowledge graph.
// NOTE: Called by hooks or CLI to maintain the temporal decision store.

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const DECISIONS_PATH = join(ROOT, ".ai", "memory", "decisions.json");

/**
 * NOTE: Evolves the knowledge graph by adding, invalidating, or retracting triples.
 * @param {object} action - { type: 'add'|'invalidate'|'retract', ... }
 * @returns {{ success: boolean, message: string }}
 */
export function evolveDecisions(action) {
	const data = loadDecisions();
	data.triples = data.triples || [];

	switch (action.type) {
		case "add":
			return handleAdd(data, action);
		case "invalidate":
			return handleInvalidate(data, action);
		case "retract":
			return handleRetract(data, action);
		default:
			return { success: false, message: `Unknown action type: ${action.type}` };
	}
}

function handleAdd(data, action) {
	const { triple } = action;
	if (!triple?.subject || !triple?.predicate || !triple?.object) {
		return {
			success: false,
			message: "Triple must have subject, predicate, and object",
		};
	}

	const id = triple.id || `triple-${Date.now()}`;
	const newTriple = {
		id,
		subject: triple.subject,
		predicate: triple.predicate,
		object: triple.object,
		validFrom: triple.validFrom || new Date().toISOString().split("T")[0],
		validTo: null,
		source: triple.source || "",
		context: triple.context || "",
	};

	data.triples.push(newTriple);
	writeDecisions(data);
	return { success: true, message: `Added triple: ${id}` };
}

function handleInvalidate(data, action) {
	const { tripleId, reason } = action;
	const triple = data.triples.find((t) => t.id === tripleId);
	if (!triple) {
		return { success: false, message: `Triple not found: ${tripleId}` };
	}
	if (triple.validTo !== null) {
		return {
			success: false,
			message: `Triple already invalidated: ${tripleId}`,
		};
	}

	triple.validTo = new Date().toISOString().split("T")[0];
	writeDecisions(data);
	return {
		success: true,
		message: `Invalidated triple: ${tripleId} — ${reason}`,
	};
}

function handleRetract(data, action) {
	const { tripleId, reason } = action;
	const idx = data.triples.findIndex((t) => t.id === tripleId);
	if (idx === -1) {
		return { success: false, message: `Triple not found: ${tripleId}` };
	}

	data.triples.splice(idx, 1);
	writeDecisions(data);
	return {
		success: true,
		message: `Retracted triple: ${tripleId} — ${reason}`,
	};
}

function loadDecisions() {
	try {
		return JSON.parse(readFileSync(DECISIONS_PATH, "utf-8"));
	} catch {
		return { version: 1, triples: [] };
	}
}

function writeDecisions(data) {
	writeFileSync(DECISIONS_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

// NOTE: CLI entry point
if (process.argv[1]?.includes("evolve.mjs")) {
	const args = process.argv.slice(2);
	const raw = args.find((a) => !a.startsWith("--"));
	if (raw) {
		const action = JSON.parse(raw);
		const result = evolveDecisions(action);
		console.log(JSON.stringify(result, null, 2));
	}
}
