# ADR-006: AI Context System Optimization

## Status

Accepted

## Context

The project used Markdown `.context.md` files per directory to maintain AI model awareness of cross-file relationships. As the codebase grew, these files became token-expensive for AI context windows:

- 8 `.context.md` files consumed ~3000+ tokens each when read
- No centralized entry point — AI had to discover and read multiple files
- No auto-generation — all context files were hand-maintained
- No token budget enforcement — files could grow unbounded
- Redundant information across `.context.md` and `docs/context-map.md`

## Decision

Convert the documentation system from verbose Markdown to token-efficient JSON with a compressed AI entry point and auto-generation tooling.

### Changes

1. **`.context.md` → `.context.json`** — Replace all per-directory Markdown context files with structured JSON validated against `docs/ai/schemas/context-schema.json`
2. **`docs/ai/system.md`** — Compressed AI entry point (~60 lines) that replaces reading multiple large files
3. **`docs/ai/symbol-index.json`** — Auto-generated master export→file lookup table
4. **`scripts/generate-ai-context.mjs`** — Zero-dependency Node.js script that auto-generates `.context.json` files via regex-based TS parsing, with merge mode to preserve hand-crafted descriptions
5. **JSON Schemas** in `docs/ai/schemas/` for validation of context files
6. **Token budgets** in `docs/ai/token-budgets.json` as aspirational targets

### Key Properties

- **Merge mode**: Running `pnpm generate-context` preserves hand-crafted descriptions in existing `.context.json` files while updating auto-detectable fields (exports, types, imports)
- **Zero dependencies**: The generation script uses only Node.js built-ins (no npm packages)
- **Layer-aware**: Each `.context.json` declares its architectural layer for validation

## Consequences

### Positive

- ~70% token reduction for AI context loading (JSON vs Markdown)
- Single entry point (`docs/ai/system.md`) replaces scattered discovery
- Auto-generation keeps context files in sync with code changes
- JSON Schema validation catches structural errors
- Symbol index enables fast export→file lookups without reading all files

### Negative

- JSON is less human-readable than Markdown for manual browsing
- Auto-generated descriptions are generic (need hand-tuning for specificity)
- One more script to maintain (`generate-ai-context.mjs`)
- Token budget warnings are noisy for large directories (aspirational, not enforced)

### Risks Mitigated

- Information loss during conversion mitigated by reading all `.context.md` files before creating `.context.json`
- Stale context mitigated by `pnpm generate-context` merge mode preserving hand-crafted data
- Schema drift mitigated by JSON Schema validation