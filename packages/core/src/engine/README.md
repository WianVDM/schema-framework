# engine

## Purpose

Layer 2 of the 3-Layer Architecture. The "Ext.NET Brain" — contains TypeScript interfaces defining what a schema is, Zod validators, and the `SchemaForm`/`SchemaGrid` renderers that read JSON schemas and produce UI by delegating to Layer 1 primitives.

## Dependencies (Imports FROM)

- `packages/core/src/primitives/` (Layer 1) — renderers use primitive components to build UI.
- `react` — for component rendering.
- External validation libraries (e.g., `zod`) for schema validation.

## Dependents (Imported BY)

- `packages/core/src/index.ts` (barrel export).
- `apps/showcase` (Layer 3) — imports engine renderers and types via `@my-framework/core`.

## Constraints

- Renderers MUST receive shadcn base components via `PrimitivesContext` or explicit `primitives` prop — never hardcode imports.
- Must use strict relative imports (e.g., `../primitives`) — NO path aliases.
- All types and interfaces must be generic and domain-agnostic.

## 🚫 FORBIDDEN

- DO NOT import from `apps/` or any Layer 3 code.
- DO NOT hardcode `@/components/ui/...` imports — use PrimitivesContext or props.
- DO NOT use `@/` path aliases — strict relative imports only.
- DO NOT contain business/domain-specific logic or hardcoded schemas.