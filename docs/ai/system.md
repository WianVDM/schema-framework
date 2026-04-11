# AI System Context

> Entry point for AI assistants. Read this first, then per-directory `.context.json` files on demand.

## Architecture: 3-Layer Monorepo

```text
Layer 1: packages/core/src/primitives/  — Generic UI wrappers (React only)
Layer 2: packages/core/src/engine/       — Schema types, validators, renderers (imports L1)
Layer 3: apps/showcase/src/              — TanStack Start routes, server functions (imports L1+L2)
```

**Dependency rule:** L3 → L2 → L1. Never upward. Never skip layers.

## Key Constraints

- **One export per file** — except barrel `index.ts`, config, test files
- **No `@/` in core** — strict relative imports only
- **No shadcn hardcodes in core** — inject via `PrimitivesContext`
- **Immutability** — `readonly` props, `ReadonlyDeep<T>`, `deepFreeze()`, branded `FieldId`/`DataKey`
- **String literal unions** — `ConditionOperator`, `ValidationType` (never bare `string`)

## Task Routing Table

| Task | Read First | Then Read |
|------|-----------|-----------|
| Add primitive | `system.md` | `.context.json` in primitives dir, `file-placement.json` |
| Add schema type | `system.md` | `.context.json` in types dir, `symbol-index-manifest.json` |
| Modify existing type | `system.md` | `.context.json` in types dir, `impact-graph.json` |
| Add validator | `system.md` | `.context.json` in validators dir, `error-taxonomy.json` |
| Add renderer | `system.md` | `.context.json` in renderers dir, `flows.json` |
| Add route | `system.md` | `.context.json` in routes dir, `flows.json` |
| Debug data flow | `system.md` | `flows.json`, `impact-graph.json` |
| Refactor cross-cutting | `system.md` | `impact-graph.json`, `symbol-index-manifest.json` |
| Fix build error | `system.md` | `error-taxonomy.json`, relevant `.context.json` |

## Context Tiers

| Tier | Path | Purpose | Generated |
|------|------|---------|-----------|
| 0 | `docs/ai/system.md` | This file — project overview + routing | Hand-crafted |
| 1 | `**/.context.json` | Per-directory file inventory + relationships | Auto (merge mode) |
| 1.5 | `docs/ai/diagrams/*.mmd` | Architecture + data flow Mermaid diagrams | Hand-crafted |
| 2 | `docs/ai/symbol-index-manifest.json` | Symbol count per layer | Auto |
| 2 | `docs/ai/symbol-index-layer{1,2,3}.json` | Export→file lookup per layer | Auto |
| 2 | `docs/ai/impact-graph.json` | Reverse dependency graph (consumedBy) | Auto |
| 2 | `docs/ai/directory-index.json` | Directory→purpose mapping | Auto |
| 2 | `docs/ai/flows.json` | User-facing data flow descriptions | Hand-crafted |
| 2 | `docs/ai/config-schema.json` | Configuration schema reference | Hand-crafted |
| 2 | `docs/ai/error-taxonomy.json` | Error catalog with fixes | Hand-crafted |
| 2 | `docs/ai/file-placement.json` | Where to put new files + what to update | Hand-crafted |
| 2 | `docs/ai/token-budgets.json` | Token/line budgets for all context files | Hand-crafted |
| 3 | `docs/ai/schemas/*.json` | JSON Schemas for validation | Hand-crafted |

## Auto-Generation

Run `pnpm generate-context` to regenerate all `.context.json` files, symbol indexes, impact graph, and directory index.
The script preserves hand-crafted descriptions via merge mode.
Use `pnpm generate-context:force` to regenerate all regardless of mtime.
Use `pnpm generate-context:check` to verify freshness without writing (CI gate).

## File Naming

| Export Type | Pattern | Example |
|------------|---------|---------|
| Interface | `kebab-case.ts` | `field-schema.ts` → `FieldSchema` |
| Component | `kebab-case.tsx` | `schema-form.tsx` → `SchemaForm` |
| Function | `kebab-case.ts` | `validate-file.ts` → `validateFile` |
| Barrel | `index.ts` | Re-exports directory contents |

## Version Workflow

1. Read `docs/VERSION_STATUS.md` for active milestone
2. Feature branches: `v{VERSION}-{type}/{desc}` off `main`
3. Core changes require `pnpm changeset`
4. Milestones close with `pnpm changeset version` + tag