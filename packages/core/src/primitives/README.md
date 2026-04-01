# primitives

## Purpose

Layer 1 of the 3-Layer Architecture. Contains generic, highly reusable UI components built on top of shadcn/ui (e.g., `DataTable`, `StatusBadge`, `AddressInput`). These components accept standard React props and know nothing about JSON schemas.

## Dependencies (Imports FROM)

- `react` only.
- shadcn/ui base components passed in via props or context (never imported directly).

## Dependents (Imported BY)

- `packages/core/src/engine/` (Layer 2 renderers consume Layer 1 primitives).
- `packages/core/src/index.ts` (barrel export).

## Constraints

- Components must accept standard React props — no schema-related props.
- Must be purely presentational and reusable across any React project.
- All components must be generic and domain-agnostic.

## 🚫 FORBIDDEN

- DO NOT import from `src/engine/` — Layer 1 must never know about Layer 2.
- DO NOT accept schema objects as props.
- DO NOT hardcode `@/components/ui/...` imports — shadcn components are received via props/context.
- DO NOT contain business logic or domain-specific behavior.