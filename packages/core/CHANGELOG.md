# @my-framework/core

## 0.1.0

### Minor Changes

- Implement schema-driven engine with renderers, PrimitivesContext, and Zustand selection store
- Align implementation with ARCHITECTURE.md (3-layer architecture, dependency rules)
- Implement Phase 2 — advanced grid, primitives, conditional forms, file upload
- Implement Phase 3 — quality fixes and production readiness
- Split types/validators into individual files, fix Zod bugs
- Enforce immutability across all schema types and validators (branded types, DeepFrozen, ReadonlyDeep)

### Patch Changes

- Fix CodeRabbit review findings (accessibility, ARIA, className, status normalization)
- Address 21 CodeRabbit PR review findings across engine and primitives
- Brand DataKey in gridSchemaValidator and eliminate unsafe casts
- Add missing GridPagination, GridColumnHeader, GridToolbar exports to engine index
- Fix `DeepFrozen` and `ReadonlyDeep` types to pass branded primitives (like `DataKey`) through unchanged, preventing typecheck failures in consumers that use branded types with `deepFreeze()`