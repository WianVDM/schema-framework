# Module 02: Context Generation

> NOTE: Script specification for auto-generating context files. Includes CLI interface, algorithms, and build integration.

## Script Config Constants

```
SCAN_EXCLUDE = [
  "docs/ai/**",
  ".context.json",
  "*.d.ts",
  "*.test.*",
  "*.spec.*",
  "node_modules/**",
  "vendor/**",
  "bin/**",
  "obj/**",
  ".git/**",
  "dist/**",
  "build/**",
  "out/**"
]
MERGE_PRESERVE_FIELDS = ["desc", "purpose", "deprecated", "tests"]
CONTEXT_FILE_GLOBS = ["docs/ai/**/*.json", "docs/ai/**/*.md", "docs/ai/**/*.mmd"]
```

## Polyglot Export Parsing

| Language | Extension | Export Regex | Import Regex |
|----------|-----------|-------------|-------------|
| TypeScript | .ts .tsx | `export\s+(interface\|type\|class\|function\|const\|enum)\s+(\w+)` | `from\s+['"](\.{1,2}[^'"]+)['"]` |
| C# | .cs | `public\s+(class\|interface\|record\|struct\|enum)\s+(\w+)` | `using\s+([\w.]+)` |
| Python | .py | `^(class\|def)\s+(\w+)` or `__all__\s*=\s*\[(.+)\]` | `from\s+([\w.]+)\s+import\|import\s+([\w.]+)` |
| Java | .java | `public\s+(class\|interface\|enum\|record)\s+(\w+)` | `import\s+([\w.]+)` |
| Go | .go | `^func\s+([A-Z]\w+)\|^type\s+([A-Z]\w+)` | `import\s+["]([^"]+)["]` |
| Rust | .rs | `pub\s+(fn\|struct\|enum\|trait\|type)\s+(\w+)` | `use\s+([\w:]+)` |

Language detection: majority file extension in directory. Mixed → `language: "mixed"`, parse each file by its extension.

## Algorithm: .context.json Generation

```
FOR each source directory with 2+ files (excluding SCAN_EXCLUDE):
  files = list source files, exclude SCAN_EXCLUDE patterns
  IF no files: SKIP

  layer = mapPathToLayer(dirPath)
  language = detectLanguage(files)
  existing = load .context.json IF present

  FOR each file:
    exports = parseExports(file, language) → [{name, type}]
    imports = parseImports(file, language) → [{path, isRelative}]

    fileEntry = {
      export: join export names with ", " (* for barrel re-exports),
      type: classified keyword from export,
      desc: existing?.desc ?? name,
      deprecated: existing?.deprecated ?? false,
      tests: existing?.tests ?? null
    }

    FOR each import:
      IF relative AND resolved path in same directory:
        rels[file].push({ path: importPath, confidence: "explicit" })
      ELSE IF relative AND resolved path outside directory:
        extDeps[file].push({ path: resolvedPath, confidence: "explicit" })
      ELSE:
        // package dependency, not tracked in extDeps

  write .context.json with $schema, layer, purpose, language, files, rels, extDeps
```

## Algorithm: Confidence Classification

```
FOR each import found in source file:
  IF matched by import regex directly (import/using/require statement):
    confidence = "explicit"
  ELSE IF inferred from:
    - Type annotation referencing known module export
    - Decorator/attribute referencing another file
    - String literal matching a known file path pattern:
    confidence = "inferred"
  ELSE:
    confidence = "explicit"
```

## Algorithm: Symbol Index Generation

```
layerSymbols = {}
FOR each .context.json:
  FOR each file entry (skip type: "re-export"):
    FOR each export name:
      layerSymbols[context.layer][name] ??= []
      layerSymbols[context.layer][name].push({
        file: relativePath,
        type: entry.type,
        category: inferCategory(dirPath, entry.type)
      })

FOR each layer:
  write minified JSON to docs/ai/symbol-index-layer-{layer}.json
write manifest to docs/ai/symbol-index-manifest.json
```

Category inference: path `/Entities/` → `entity`, `/Services/` → `service`, `/Repository/` → `repository`, `/Controllers/` → `controller`, `/Plugins/` → `plugin`, type `enum` → `enum`, else → `utility`. Customize per project.

## Algorithm: Impact Graph Generation

```
impacts = {}
FOR each .context.json:
  FOR each file IN context.extDeps:
    FOR each depEntry in extDeps[file]:
      depPath = depEntry.path
      impacts[depPath] ??= { consumedBy: [], consumerCount: 0, layerSpan: [] }
      impacts[depPath].consumedBy.push(dirPath + "/" + file)
      IF source layer NOT IN impacts[depPath].layerSpan:
        impacts[depPath].layerSpan.push(source layer)

FOR each impact:
  impact.consumerCount = impact.consumedBy.length

SORT impacts by consumerCount descending
write minified to docs/ai/impact-graph.json
```

## Algorithm: Core Abstractions (God Nodes)

```
abstractions = TOP 10 from impacts sorted by consumerCount DESC
  WHERE consumerCount >= 3

FOR each:
  lookup export name from source .context.json file entry

write to docs/ai/core-abstractions.json
```

## Algorithm: Insights Generation

```
crossLayerDeps = []
FOR each .context.json (sourceLayer):
  FOR each file IN extDeps:
    FOR each depEntry:
      depDir = resolve depEntry.path to directory
      depLayer = lookup layer for depDir
      IF depLayer != sourceLayer:
        crossLayerDeps.push({ source, target, sourceLayer, depLayer })

highImpactFiles = TOP 10 from impact-graph WHERE layerSpan.length >= 2

circularWarnings = detect cycles:
  build adjacency list from all extDeps
  run DFS cycle detection
  FOR each cycle found (max 5):
    circularWarnings.push({ cycle: [path1, path2, ...] })

write to docs/ai/insights.json
```

## Algorithm: Community Detection (Simplified Jaccard)

```
dirDepSets = {}
FOR each .context.json:
  allDeps = flatten all extDeps paths
  dirDepSets[dirPath] = Set(allDeps)

communities = []
used = Set()
FOR each dirA in dirDepSets:
  IF dirA IN used: SKIP
  community = [dirA]
  FOR each dirB in dirDepSets:
    IF dirB IN used OR dirB == dirA: SKIP
    intersection = dirDepSets[dirA] ∩ dirDepSets[dirB]
    union = dirDepSets[dirA] ∪ dirDepSets[dirB]
    jaccard = intersection.size / union.size
    IF jaccard >= 0.3:
      community.push(dirB)
      used.add(dirB)
  used.add(dirA)

  IF community.length > 1:
    sharedDeps = intersection of all depSets in community
    cohesionScore = sharedDeps.size / union of all depSets in community
    communities.push({ label, directories: community, sharedDeps, cohesionScore })

write to docs/ai/community-map.json
```

## Algorithm: Directory Index Generation

```
directories = {}
FOR each .context.json:
  directories[dirPath] = context.purpose
write minified to docs/ai/directory-index.json
```

## Algorithm: Diff Generation (--diff flag)

```
IF docs/ai/last-diff.json exists:
  previousFiles = load set of all generated file paths from last run
ELSE:
  previousFiles = {}

currentFiles = set of all files that WOULD be generated

added = currentFiles - previousFiles
removed = previousFiles - currentFiles
modified = files where content hash changed

write to docs/ai/last-diff.json:
  { generatedAt, added: [...], removed: [...], modified: [...], summary: "..." }
```

## Algorithm: AST Deep Mode (--deep flag, optional)

```
FOR each file in directories with 10+ files OR explicitly flagged:
  parse AST (use language-appropriate parser or regex heuristics)
  FOR each type/interface reference found in the file:
    IF referenced type is defined in another file in same directory:
      add to internalRefs array in file entry

  FOR each type reference crossing files within directory:
    add to rels with confidence: "inferred"
```

## `--check` Flag: Semantic Freshness Lint

The `--check` flag runs 4 deterministic freshness checks without writing files.
Exit code 0 if all pass, 1 if any violations. Designed for CI integration.

| # | Check | What it detects |
|---|-------|-----------------|
| 1 | Missing files | Source files not in `.context.json` |
| 2 | Phantom exports | `.context.json` entries for exports that no longer exist |
| 3 | Lazy descriptions | `desc` fields identical to export name (no human curation) |
| 4 | Stale timestamps | `generatedAt` >30 days old |

Each check produces a list of violations. The full report is printed to stdout.
CI integration: `generate-context --check` in CI pipeline.

## Algorithm: Activity Tracking (--diff flag)

```
recentSessions array in last-diff.json:
  Auto-append session entry on each generation run:
  { date, type, summary, filesChanged }

  Auto-truncate to 5 most recent entries (FIFO).
  Type enum: feature, fix, refactor, docs, chore.
```

## Script Output Formatting

- `.context.json`: 2-space indent (humans edit desc/purpose)
- All other generated JSON: minified (no whitespace) — 3-10x token savings
- All generated files include `$schema` and `generatedAt` ISO 8601 timestamp
- Validate against token budgets, WARN (stderr) if any file exceeds budget

## Script Language Selection

Choose based on project's primary language:
- TypeScript/JS project → Node.js script (`generate-ai-context.mjs`)
- C#/.NET project → PowerShell (`generate-ai-context.ps1`) or C# console app
- Python project → Python (`generate_ai_context.py`)
- Go project → Go program or shell script
- Mixed/polyglot → Node.js (most universal) or Python

## CLI Interface

```
generate-context            // full regeneration
generate-context --update   // only regenerate changed directories (mtime check)
generate-context --deep     // include AST-level internalRefs
generate-context --check    // exit non-zero if any output would change (CI mode)
generate-context --diff     // output last-diff.json with change summary
```

## Build Integration

Add as prebuild hook or separate command: `"generate-context": "node scripts/generate-ai-context.mjs"` (or equivalent). Run automatically on build, manually on-demand.