# packages

## Purpose

Contains all reusable library packages for the Schema Framework monorepo. Each package is published independently to the private npm registry.

## Dependencies (Imports FROM)

- External npm packages only (no monorepo-internal imports).

## Dependents (Imported BY)

- `apps/showcase` (Layer 3) and any future application packages.

## Constraints

- Each package must be self-contained with its own `package.json`, `tsconfig.json`, and build pipeline.
- Packages must use `tsup` for building to produce ESM output with TypeScript declarations.

## 🚫 FORBIDDEN

- DO NOT import from `apps/` — packages are lower-level than applications.
- DO NOT couple packages to specific business logic (e.g., shipment tracking, order management).