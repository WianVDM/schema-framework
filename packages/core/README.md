# core

## Purpose

The `@my-framework/core` library package containing Layer 1 (Primitives) and Layer 2 (Engine) of the 3-Layer Architecture. This is the reusable, publishable npm package that powers data-driven UI rendering.

## Dependencies (Imports FROM)

- `react` (peer dependency)
- External npm packages only (e.g., `zod` for validation in future phases)
- Internal: `src/primitives` and `src/engine` import nothing from each other or outside this package.

## Dependents (Imported BY)

- `apps/showcase` (Layer 3) via `@my-framework/core` workspace dependency.
- Any future application that installs `@my-framework/core` from the npm registry.

## Constraints

- Must use strict relative imports only (e.g., `./primitives`, `../engine`). NO path aliases like `@/`.
- Must use `tsup` for building (ESM + DTS output).
- Must remain generic — no business logic, no specific domain concepts.
- shadcn/ui components CANNOT be hardcoded here; they must be passed in via `PrimitivesContext` or props.

## 🚫 FORBIDDEN

- DO NOT use `@/` path aliases — strict relative imports only.
- DO NOT import from `@/components/ui/...` or any shadcn path.
- DO NOT import from `apps/` or any application layer.
- DO NOT contain business/domain-specific logic (e.g., shipment tracking, order management).