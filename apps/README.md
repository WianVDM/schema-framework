# apps

## Purpose

Contains all application packages in the Schema Framework monorepo. Each app is a standalone application that consumes the `@my-framework/core` library package.

## Dependencies (Imports FROM)

- `packages/core` (`@my-framework/core`) via workspace dependency.
- External npm packages as needed per application.

## Dependents (Imported BY)

- None — applications are the top-level consumers in the monorepo.

## Constraints

- Each app must have its own `package.json` and build configuration.
- Apps are responsible for passing shadcn/ui primitives into core library components via `PrimitivesContext` or props.

## 🚫 FORBIDDEN

- DO NOT publish application code as reusable packages.
- DO NOT import from `apps/` into `packages/` — dependency direction is strictly one-way.