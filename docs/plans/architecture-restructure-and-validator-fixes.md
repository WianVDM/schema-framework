# Implementation Plan: Architecture Doc Restructure & Validator Fixes

[Overview]
Restructure ARCHITECTURE.md to focus purely on core architecture, fix Zod validator bugs, and enforce one-export-per-file rule on types.ts and validators.ts.

This plan addresses three categories of issues found during architecture audit: (1) documentation restructuring — moving ARCHITECTURE.md to root and extracting phase status to a separate file, (2) Zod validator bugs where 'address' field type and serverPagination/i18n grid schema fields are missing, and (3) one-export-per-file violations in types.ts (22 exports) and validators.ts (8 exports) that contradict the workspace .clinerules.

[Types]
No new types are introduced. Existing types remain identical — only their file locations change.

Types affected by file split:
- `FieldType` — moves from `types.ts` to `types/field-type.ts`
- `SelectOption` — moves to `types/select-option.ts`
- `ValidationRule` — moves to `types/validation-rule.ts`
- `FieldCondition` — moves to `types/field-condition.ts`
- `FileUploadConfig` — moves to `types/file-upload-config.ts`
- `FieldSchema` — moves to `types/field-schema.ts`
- `I18nConfig` — moves to `types/i18n-config.ts`
- `FormSchema` — moves to `types/form-schema.ts`
- `PaginationConfig` — moves to `types/pagination-config.ts`
- `ColumnFilterConfig` — moves to `types/column-filter-config.ts`
- `StatusConfig` — moves to `types/status-config.ts`
- `GridColumnSchema` — moves to `types/grid-column-schema.ts`
- `ServerPaginationConfig` — moves to `types/server-pagination-config.ts`
- `ThemeConfig` — moves to `types/theme-config.ts`
- `GridSchema` — moves to `types/grid-schema.ts`
- `PrimitiveComponents` — moves to `types/primitive-components.ts`
- `FormSubmitHandler` — moves to `types/form-submit-handler.ts`
- `SelectionStore` — moves to `types/selection-store.ts`
- `FieldRendererProps` — moves to `types/field-renderer-props.ts`
- `SchemaFormProps` — moves to `types/schema-form-props.ts`
- `SchemaGridProps` — moves to `types/schema-grid-props.ts`
- `CellValueRenderer` — moves to `types/cell-value-renderer.ts`

Validator exports affected by file split:
- `fieldSchemaValidator`, `validateFieldSchema` — moves to `validators/field-schema.ts`
- `formSchemaValidator`, `validateFormSchema` — moves to `validators/form-schema.ts`
- `gridSchemaValidator`, `validateGridSchema` — moves to `validators/grid-schema.ts`
- `validateFieldValue` — moves to `validators/field-value.ts`
- `evaluateCondition` — moves to `validators/evaluate-condition.ts`
- Internal Zod schemas (`fieldTypeSchema`, `selectOptionSchema`, etc.) — shared in `validators/shared-schemas.ts`

[Files]

## New Files to Create

### Documentation
- `ARCHITECTURE.md` (root) — Core architecture only (sections 1-6 + appendices), updated monorepo tree
- `docs/implementation-status.md` — Phase tracking, known bugs, Phase 4 roadmap

### Types directory (`packages/core/src/engine/types/`)
- `field-type.ts`, `select-option.ts`, `validation-rule.ts`, `field-condition.ts`, `file-upload-config.ts`
- `field-schema.ts`, `i18n-config.ts`, `form-schema.ts`, `pagination-config.ts`, `column-filter-config.ts`
- `status-config.ts`, `grid-column-schema.ts`, `server-pagination-config.ts`, `theme-config.ts`, `grid-schema.ts`
- `primitive-components.ts`, `form-submit-handler.ts`, `selection-store.ts`
- `field-renderer-props.ts`, `schema-form-props.ts`, `schema-grid-props.ts`, `cell-value-renderer.ts`
- `index.ts` — barrel re-exporting all types

### Validators directory (`packages/core/src/engine/validators/`)
- `shared-schemas.ts` — internal Zod schemas (not exported publicly)
- `field-schema.ts`, `form-schema.ts`, `grid-schema.ts`, `field-value.ts`, `evaluate-condition.ts`
- `index.ts` — barrel re-exporting all public validators

## Files to Modify

- `packages/core/src/engine/index.ts` — update re-export paths from `./types` to `./types/` and `./validators` to `./validators/`
- `packages/core/src/engine/renderers/field-renderer.tsx` — update type imports
- `packages/core/src/engine/renderers/schema-form.tsx` — update type and validator imports
- `packages/core/src/engine/renderers/schema-grid.tsx` — update type imports
- `packages/core/src/engine/renderers/grid-toolbar.tsx` — update type imports
- `packages/core/src/engine/renderers/grid-column-header.tsx` — update type imports (if imports from types)
- `packages/core/src/engine/renderers/grid-pagination.tsx` — update type imports (if imports from types)
- `packages/core/src/engine/renderers/theme-provider.tsx` — update type imports
- `packages/core/src/engine/renderers/index.ts` — no change needed (re-exports from same directory)
- `packages/core/src/engine/context/primitives-context.tsx` — update type imports
- `packages/core/src/engine/helpers/i18n.ts` — update type imports
- `.gitignore` — remove `!docs/ARCHITECTURE.md` exception
- `.clinerules/workspace-behaviors.md` — update `docs/architecture.md` reference to root `ARCHITECTURE.md`
- `.clinerules/workspace-rules.md` — update all `docs/ARCHITECTURE.md` references to root `ARCHITECTURE.md`, add root exception for ARCHITECTURE.md
- `docs/context-map.md` — populate with actual implementation state

## Files to Delete

- `docs/ARCHITECTURE.md` — moved to root
- `packages/core/src/engine/types.ts` — replaced by `types/` directory
- `packages/core/src/engine/validators.ts` — replaced by `validators/` directory

## Context Maps to Update

- `packages/core/src/engine/.context.md` — reflect new types/ and validators/ directories
- `packages/core/src/engine/renderers/.context.md` — update import paths
- `packages/core/src/primitives/.context.md` — no change needed (doesn't import from types)

[Functions]

## New Functions
None — all functions are being moved, not created.

## Modified Functions

### Validator Bug Fixes (in `validators/shared-schemas.ts` after split)
- `fieldTypeSchema` — add `'address'` to the z.enum array
- `gridSchemaValidator` — add `serverPagination` and `i18n` fields to match TypeScript `GridSchema` interface

## Moved Functions
- All exports from `types.ts` → individual files in `types/` directory
- All exports from `validators.ts` → individual files in `validators/` directory
- Import paths in all consuming files update accordingly

[Classes]
No classes are affected. This project uses functional components and type aliases.

[Dependencies]
No new dependencies. All existing dependencies remain unchanged.

[Testing]

1. Run `pnpm build` from root after each major step to verify TypeScript compilation
2. Run `pnpm typecheck` to verify no type errors introduced
3. Manually verify that the Zod validators now accept `'address'` field type and `serverPagination`/`i18n` on grid schemas
4. Verify all .clinerules references point to correct file locations

[Implementation Order]

1. **Create branch** `refactor/architecture-doc-restructure-and-validator-fixes` — DONE
2. **Fix Zod validator bugs** — Add `'address'` to fieldTypeSchema, add `serverPagination`/`i18n` to gridSchemaValidator in `validators.ts`
3. **Run `pnpm build`** — verify validators still compile
4. **Create `packages/core/src/engine/types/` directory** — split types.ts into 22 individual files + barrel index.ts
5. **Update all type imports** — in renderers, context, helpers, and engine index
6. **Delete old `types.ts`**
7. **Run `pnpm build`** — verify types split compiles
8. **Create `packages/core/src/engine/validators/` directory** — split validators.ts into 6 files + barrel index.ts
9. **Update all validator imports** — in renderers and engine index
10. **Delete old `validators.ts`**
11. **Run `pnpm build`** — verify validators split compiles
12. **Create root `ARCHITECTURE.md`** — sections 1-6 + appendices, fixed monorepo tree
13. **Create `docs/implementation-status.md`** — phase status + known bugs + Phase 4 roadmap
14. **Delete `docs/ARCHITECTURE.md`**
15. **Update `.gitignore`** — remove docs/ARCHITECTURE.md exception
16. **Update `.clinerules/workspace-behaviors.md`** — fix architecture.md path
17. **Update `.clinerules/workspace-rules.md`** — fix architecture.md paths + add root exception
18. **Update `docs/context-map.md`** — populate with actual implementation state
19. **Update `.context.md` files** — for engine/ and renderers/ directories
20. **Run `pnpm build` final verification**
21. **Commit all changes**