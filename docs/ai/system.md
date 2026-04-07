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

## Context Files

| Path | Purpose |
|------|---------|
| `docs/ai/symbol-index.json` | Master export→file lookup (auto-generated) |
| `docs/ai/file-placement.json` | Where to put new files + what to update |
| `docs/ai/schemas/*.json` | JSON Schemas for `.context.json` validation |
| `**/.context.json` | Per-directory file inventory + relationships |
| `docs/VERSION_STATUS.md` | Active milestone + checklist |
| `docs/roadmap.md` | Full version roadmap |
| `ARCHITECTURE.md` | Detailed architecture blueprint |

## Auto-Generation

Run `pnpm generate-context` to regenerate all `.context.json` files and `symbol-index.json`.
The script preserves hand-crafted descriptions via merge mode.

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