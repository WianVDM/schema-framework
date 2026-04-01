# showcase

## Purpose

Layer 3 (Composition) of the 3-Layer Architecture. A TanStack Start application that demonstrates and tests the `@my-framework/core` library by rendering data-driven UIs from JSON schemas. This is the "Ext.NET Examples Dashboard" equivalent.

## Dependencies (Imports FROM)

- `@my-framework/core` (Layer 2 Engine and Layer 1 Primitives) via workspace symlink.
- `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query` — routing, SSR, and data fetching.
- `react`, `react-dom` — UI runtime.
- `vinxi` — server runner for TanStack Start.
- `zod` — schema validation.
- shadcn/ui components (copy-pasted into `src/components/ui/`).

## Dependents (Imported BY)

- None — this is a terminal consumer application.

## Constraints

- Uses TanStack Start file-based routing with `createFileRoute` (NOT Next.js App Router).
- Uses `@/` path alias mapped to `./src/*` in tsconfig.json.
- Responsible for passing shadcn/ui primitives into core library components via `PrimitivesContext` or props.
- Tailwind v4 with `@tailwindcss/vite` plugin (not PostCSS).

## 🚫 FORBIDDEN

- DO NOT use Next.js App Router conventions (`app/page.tsx`, `app/layout.tsx`, etc.).
- DO NOT put reusable library code here — move it to `packages/core`.
- DO NOT hardcode business schemas in production routes — use mock data in `server/` for development only.
- DO NOT import from `@my-framework/core` using anything other than the documented exports (`.`, `./primitives`, `./engine`).