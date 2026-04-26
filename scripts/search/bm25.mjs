// NOTE: BM25 keyword matching over .context.json file content.
// NOTE: Pure keyword search — no external dependencies, no embedding models.

/**
 * NOTE: Performs BM25 keyword search across context files.
 * @param {string} query - Search query string
 * @param {Array<{path: string, content: string}>} documents - Context files with content
 * @param {object} options - { k1?: number, b?: number, maxResults?: number }
 * @returns {Array<{directory: string, score: number, matchedTerms: string[], snippet: string}>}
 */
export function bm25Search(query, documents, options = {}) {
	const { k1 = 1.2, b = 0.75, maxResults = 5 } = options;
	const queryTerms = tokenize(query);
	if (queryTerms.length === 0 || documents.length === 0) return [];

	// NOTE: Pre-compute tokenized documents, lengths, and term frequency maps
	const tokenizedDocs = documents.map((d) => tokenize(d.content));
	const docLengths = tokenizedDocs.map((t) => t.length);
	const avgDocLen = docLengths.reduce((a, b) => a + b, 0) / docLengths.length;
	const tfMaps = tokenizedDocs.map((terms) => buildTermFreqMap(terms));

	// NOTE: Compute document frequency for each query term using pre-computed maps
	const df = new Map();
	for (const term of queryTerms) {
		const count = tfMaps.filter((tfMap) => tfMap.has(term)).length;
		df.set(term, count);
	}

	const N = documents.length;
	const results = [];

	for (let i = 0; i < documents.length; i++) {
		const docLen = docLengths[i];
		const tfMap = tfMaps[i];
		let score = 0;
		const matchedTerms = [];

		for (const term of queryTerms) {
			const tf = tfMap.get(term) || 0;
			if (tf === 0) continue;
			matchedTerms.push(term);

			const dfVal = df.get(term) || 0;
			const idf = Math.log((N - dfVal + 0.5) / (dfVal + 0.5) + 1);
			const tfNorm =
				(tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docLen) / avgDocLen));
			score += idf * tfNorm;
		}

		if (matchedTerms.length > 0) {
			results.push({
				directory: doc.path,
				score: Math.round(score * 100) / 100,
				matchedTerms,
				snippet: doc.content.slice(0, 200),
			});
		}
	}

	results.sort((a, b) => b.score - a.score);
	return results.slice(0, maxResults);
}

function tokenize(text) {
	return (text || "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((t) => t.length > 1);
}

function buildTermFreqMap(terms) {
	const map = new Map();
	for (const t of terms) {
		map.set(t, (map.get(t) || 0) + 1);
	}
	return map;
}
