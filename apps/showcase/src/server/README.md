# server

## Purpose

Mock TanStack server functions that return fake JSON schemas and business data for development and demonstration purposes.

## Dependencies (Imports FROM)

- `@tanstack/react-start` (for `createServerFn`)
- Mock data definitions (inline or shared from `../data/mock-schemas`)

## Dependents (Imported BY)

- `apps/showcase/src/routes/` — routes call these server functions via `useQuery`

## Constraints

- Functions must use `createServerFn` from `@tanstack/react-start`
- All data returned is mock/static — no real database connections
- Keep server functions thin; actual schema definitions live in `../data/mock-schemas`

## 🚫 FORBIDDEN

- DO NOT import shadcn/ui components here
- DO NOT import from `@my-framework/core` engine renderers
- DO NOT connect to real databases or external APIs