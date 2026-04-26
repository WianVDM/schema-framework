# Module 01: Context Architecture

> NOTE: Tiered context system design. Defines how AI context is organized, read, and budgeted.

## Tier Definitions

```
Tier 0: docs/ai/system.md                    → Compressed entry point (~800 tokens max)
Tier 1: **/.context.json                     → Per-directory context (auto-generated, human-curated fields)
Tier 1.5: docs/ai/diagrams/*.mmd             → Mermaid diagrams (hand-crafted, optional)
Tier 2: docs/ai/core-abstractions.json       → Top N most-depended-on exports (auto-generated)
Tier 2: docs/ai/insights.json                → Cross-layer surprises + circular deps (auto-generated)
Tier 2: docs/ai/community-map.json           → Directory clusters by shared deps (auto-generated)
Tier 2: docs/ai/impact-graph.json            → Reverse dependency lookup (auto-generated)
Tier 2: docs/ai/symbol-index-manifest.json   → Layer → symbol index file map (auto-generated)
Tier 2: docs/ai/symbol-index-layer-{N}.json  → Per-layer export→file lookup (auto-generated)
Tier 2: docs/ai/directory-index.json         → Directory → purpose map (auto-generated)
Tier 2: docs/ai/file-placement.json          → "Where to put new X?" rules (hand-crafted)
Tier 2: docs/ai/flows.json                   → Data/request flow descriptions (hand-crafted)
Tier 2: docs/ai/error-taxonomy.json          → Exception hierarchy (hand-crafted, optional)
Tier 2: docs/ai/config-schema.json           → Config shape without secrets (hand-crafted, optional)
Tier 2: docs/ai/last-diff.json               → What changed since last generation (auto-generated)
Tier 3: docs/ai/schemas/*.json               → JSON Schemas for validation
```

## Read Order

Tier 0 at task start → Tier 1 on demand per directory → Tier 2 for lookups → Tier 3 for schema validation.

## Token Budgets Per Tier

| Tier | File | Max Tokens | Max Lines | When Loaded |
|------|------|-----------|-----------|-------------|
| 0 | `system.md` | 800 | 80 | Every task start |
| 1 | `.context.json` | 200 | 30 | When working in directory |
| 1.5 | `diagrams/*.mmd` | 400 | — | Cross-layer tasks |
| 2 | `symbol-index-manifest.json` | 100 | — | Symbol lookup |
| 2 | `symbol-index-layer-{N}.json` | 400 | — | Export→file lookup |
| 2 | `core-abstractions.json` | 200 | — | New features, refactoring |
| 2 | `insights.json` | 200 | — | Cross-layer analysis |
| 2 | `community-map.json` | 200 | — | Related directory discovery |
| 2 | `impact-graph.json` | 400 | — | Change impact analysis |
| 2 | `file-placement.json` | 300 | — | Creating new files |
| 2 | `flows.json` | 500 | — | Data flow tracing |
| 2 | `error-taxonomy.json` | 200 | — | Bug investigation |
| 2 | `config-schema.json` | 300 | — | Config changes |
| 2 | `directory-index.json` | 300 | — | Directory navigation |
| 2 | `last-diff.json` | 200 | — | Activity tracking |
| 3 | `schemas/*.json` | — | — | Validation only |

Token estimation: `Math.ceil(text.length / 4)` for prose, `Math.ceil(text.length / 3)` for JSON. Budgets are guidelines — WARN on exceed, don't fail.

## Migration Detection

BEFORE generating context, detect existing context system:

IF `docs/ai/` exists WITH `.context.json` files → SCENARIO: UPGRADE
IF `docs/ai/` exists WITHOUT `.context.json` → SCENARIO: PARTIAL
ELSE → SCENARIO: FRESH

**UPGRADE rules:**
- Exclude all context files from source scanning
- `.context.json`: PRESERVE `desc`, `purpose`, `deprecated`, `tests`. REGENERATE `export`, `type`, `rels`, `extDeps`. ADD `confidence` where missing
- Auto-generated Tier 2 files (have `generatedAt`): OVERWRITE
- Hand-crafted Tier 2 files: SKIP
- New Tier 2 files: CREATE
- Existing generation script: BACKUP as `.bak`, REPLACE

**PARTIAL rules:** Same as UPGRADE but treat existing `docs/ai/` files as hand-crafted (skip all).

**FRESH rules:** No special handling. Proceed through all phases.