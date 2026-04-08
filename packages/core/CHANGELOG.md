# @my-framework/core

## 0.2.0

### Minor Changes

- 957e614: feat: add DatePicker primitive with date-fns + react-day-picker

  - Add `DatePickerConfig` type with format, placeholder, minDate, maxDate options
  - Add `datePickerConfigSchema` Zod validator
  - Create self-contained `DatePicker` primitive in Layer 1 (date-fns + react-day-picker)
  - Add `dateConfig` property to `FieldSchema` for schema-driven date constraints
  - Add `DatePicker` to `PrimitiveComponents` and `PrimitivesContext` defaults
  - Update field renderer `case 'date'` to render `DatePicker` via `PrimitivesContext`
  - Extract `useTheme` hook to separate file (one-export-per-file rule)
  - Extract `AddressData` and `AddressPlaceholders` to separate files
  - Add `date-fns` and `react-day-picker` as peer dependencies

- feat: add MultiSelect field type and TagInput primitive

  - Add `'multiselect'` to `FieldType` union
  - Add `MultiSelectConfig` type with maxItems, allowCustomTags, and placeholder options
  - Add `multiSelectConfigSchema` Zod validator
  - Create `TagInput` primitive in Layer 1 with keyboard navigation and tag management
  - Add `TagInput` to `PrimitiveComponents` and `PrimitivesContext` defaults
  - Update field renderer `case 'multiselect'` to render `TagInput` via `PrimitivesContext`
  - Add showcase demo route (`/demo-multi-select`)

- e09fc91: Add SchemaWizard renderer with multi-step form support, per-step validation, optional review step, and step indicator primitive.

### Patch Changes

- 26adb7a: feat(grid): add virtualized scrolling with @tanstack/react-virtual integration

  - Add `containerHeight` to `VirtualScrollConfig` for configurable scroll container height
  - Apply `.strict()` to `virtualScrollConfigSchema` Zod validator to reject unknown properties
  - Fix server pagination UI rendering when virtual scroll is enabled
  - Use schema-driven container height with fallback to default 600px
  - Add immutable query cache settings to virtual grid demo route

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
