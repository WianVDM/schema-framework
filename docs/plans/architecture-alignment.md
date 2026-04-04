# Architecture Alignment Plan

## Objective

Bring the implementation fully in sync with `docs/ARCHITECTURE.md`. The document is the baseline. Where the implementation diverges for objectively better reasons, update the document to reflect the improved pattern.

## Branch

`feat/architecture-alignment`

## Steps

### Step 1: Create Branch & Install Missing Dependencies

- Create branch from `main`
- Install `@tanstack/react-table` and `@tanstack/react-form` in both `packages/core` (peer deps) and `apps/showcase`

### Step 2: Create `apps/showcase/src/server/` — Mock Server Functions

- Create TanStack server functions returning fake schemas and data
- Files: `schemas.ts`, `data.ts`
- AI-README for the directory

### Step 3: Wire Up TanStack Query (`useQuery`)

- Add `QueryClientProvider` to the app root
- Refactor `demo-form.tsx` and `demo-grid.tsx` to fetch schemas/data via `useQuery` from server functions

### Step 4: Integrate `@tanstack/react-table` into SchemaGrid

- Refactor `schema-grid.tsx` to use TanStack Table
- Preserve all existing features (sorting, row click, alignment, empty state)

### Step 5: Integrate `@tanstack/react-form` into SchemaForm

- Refactor `schema-form.tsx` to use TanStack Form
- Track dirty state, touched/untouched fields
- Preserve existing validation integration

### Step 6: Build Layer 1 Primitives

- Create `data-table.tsx`, `status-badge.tsx`, `address-input.tsx` in `packages/core/src/primitives/`
- Update exports

### Step 7: Sync `docs/ARCHITECTURE.md`

- Update Section 3 (folder structure)
- Update Section 4 (state management table)
- Expand Section 5 (PrimitivesContext docs)
- Document additional field types
- Update Appendix B (package configs)
- Add server function documentation

### Step 8: End-of-Task Validation

- `pnpm run build` — zero errors
- `pnpm dev` — all routes render