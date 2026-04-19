# @my-framework/core

## 0.4.0

### Minor Changes

- [#28](https://github.com/WianVDM/schema-framework/pull/28) [`23510d3`](https://github.com/WianVDM/schema-framework/commit/23510d372de3dfc68ae4fc2ea00ed42f87d71fd8) Thanks [@WianVDM](https://github.com/WianVDM)! - Add layout system renderers: ContentRenderer, SchemaPanel, SchemaLayout with border layout support

  - **ContentRenderer**: Central dispatcher for all 6 ContentSchema variants (form, grid, wizard, tabs, layout, custom)
  - **SchemaPanel**: Engine renderer wrapping Panel primitive with LayoutRegion config
  - **SchemaLayout**: Border layout renderer (N/S/E/W/C regions) with resizable panels and collapse/expand
  - **BorderPosition type**: String literal union for border layout positions
  - **validateBorderLayout**: Zod validator for border layout constraints (exactly one center, no duplicates)
  - **useResponsiveCollapse**: Runtime hook using matchMedia for responsive panel collapse
  - **LayoutPrimitiveComponents**: Extended with ResizablePanelGroup, ResizablePanel, ResizableHandle slots
  - **Showcase**: Added mock border layout data and `/demo-border-layout` demo route
  - **Versioning**: Corrected to Option C (version core only, showcase = 0.0.0-dev)

### Patch Changes

- [#28](https://github.com/WianVDM/schema-framework/pull/28) [`23510d3`](https://github.com/WianVDM/schema-framework/commit/23510d372de3dfc68ae4fc2ea00ed42f87d71fd8) Thanks [@WianVDM](https://github.com/WianVDM)! - Fix border-layout validator error paths, region size parsing, center detection, and responsive class emission

  - **border-layout.ts**: Fix `extractPositions` to preserve original region indices so `ctx.addIssue` error paths point to the correct region
  - **schema-layout.tsx**: Add NaN-safe parsing for `getRegionSize`/`extractNumericSize` with fallback to `BORDER_DEFAULT_SIZES`; fix `categorizeRegions` to explicitly find the center region instead of defaulting to `regions[0]`
  - **apply-responsive-classes.ts**: Remove incorrect `border-collapse` CSS class for `collapsedBelow` — panel collapse is handled by the renderer via ResizeObserver/matchMedia, not CSS

## 0.3.1

### Patch Changes

- [#21](https://github.com/WianVDM/schema-framework/pull/21) [`03b77f4`](https://github.com/WianVDM/schema-framework/commit/03b77f407546b3c14c49771d9ee09c215492b1f7) Thanks [@WianVDM](https://github.com/WianVDM)! - Add layout system types, validators, primitives, contexts, and helpers

  - LayoutType union: 'border' | 'accordion' | 'card' | 'hbox' | 'vbox'
  - ContentSchema discriminated union (form, grid, wizard, tabs, layout, custom)
  - LayoutSchema, LayoutRegion, DashboardSchema, TabSchema, TabItem types
  - ResponsiveConfig for per-region breakpoint overrides
  - LayoutPrimitiveComponents interface (separate from PrimitiveComponents)
  - CustomComponentRegistry for user-defined components
  - LayoutRendererProps, DashboardRendererProps, TabsRendererProps, ContentRendererProps
  - Zod validators for all new types (responsive-config, tab-schema, content-schema, layout-schema, dashboard-schema)
  - Content type guards (isFormContent, isGridContent, isWizardContent, isTabsContent, isLayoutContent, isCustomContent)
  - applyResponsiveClasses helper (ResponsiveConfig → Tailwind classes)
  - Panel and Splitter Layer 1 primitives
  - LayoutPrimitivesContext with console.warn fallback
  - CustomComponentContext with silent empty fallback

## 0.3.0

### Minor Changes

- [#16](https://github.com/WianVDM/schema-framework/pull/16) [`8b2f0bc`](https://github.com/WianVDM/schema-framework/commit/8b2f0bc38fc64ab41c789c690e01808e9cc08ed4) Thanks [@WianVDM](https://github.com/WianVDM)! - Add column reordering via @dnd-kit, onStepChange/onColumnOrderChange callbacks, shared isFieldVisible helper, and named DefaultFallbackComponent

### Patch Changes

- [#15](https://github.com/WianVDM/schema-framework/pull/15) [`303589e`](https://github.com/WianVDM/schema-framework/commit/303589e3cb183b5af1ef1e813d686d9a8deab996) Thanks [@WianVDM](https://github.com/WianVDM)! - Update wizard-schema

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
