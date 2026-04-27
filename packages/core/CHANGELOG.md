# @my-framework/core

## 0.4.0

### Minor Changes

- [`913b159`](https://github.com/WianVDM/schema-framework/commit/913b15996b8950239821f711185d1bd86257927f) Thanks [@WianVDM](https://github.com/WianVDM)! - Add v0.4.0 Advanced Data Components: SchemaTree, SchemaChart, SchemaTreeGrid, and real-time polling

  - Add `tree`, `chart`, `treeGrid` variants to ContentSchema discriminated union
  - Add `TreeSchema`, `TreeNode` types with selection, icons, lazy-loading support
  - Add `ChartSchema`, `ChartSeries` types supporting line, bar, area, pie, scatter, doughnut chart types
  - Refactor chart/tree-grid types into individual files (chart-type, chart-data-point, chart-series, chart-axis, chart-legend, chart-tooltip, chart-grid, context-menu-item, refresh-strategy, tree-grid-row)
  - Add `TreeGridSchema`, `TreeGridRow` types sharing `GridColumnSchema` for column definitions
  - Add `RealtimeConfig` type and `useRealtime` hook for polling-based data refresh
  - Add `ContextMenuConfig` type for context menu actions on tree nodes
  - Add Zod validators: `treeSchemaValidator`, `chartSchemaValidator`, `treeGridSchemaValidator`
  - Add renderers: `SchemaTree`, `SchemaChart`, `SchemaTreeGrid` with ContentRenderer dispatch
  - Add type guards: `isTreeContent`, `isChartContent`, `isTreeGridContent`
  - Add `SchemaTreeProps`, `SchemaChartProps`, `SchemaTreeGridProps` data-separate-from-schema types

## 0.3.4

### Patch Changes

- [#34](https://github.com/WianVDM/schema-framework/pull/34) [`c9c0a78`](https://github.com/WianVDM/schema-framework/commit/c9c0a7877955de4f8274ba8b2766f6f8006ad082) Thanks [@WianVDM](https://github.com/WianVDM)! - Add/Fix/... index, box-layout, schema-layout and 8 more

  **Areas:** engine, engine/renderers, engine/types and 1 more

  **Affected symbols:** export, isStacked, effectiveDirection, useStackBelow, query, handleChange and 37 more

  - **index.ts**: Add export
  - **box-layout.tsx**: Fix export, isStacked, effectiveDirection and 3 more
  - **index.ts**: Add export
  - **schema-layout.tsx**: Add import, export
  - **box-config.ts**: Add export
  - **dashboard-renderer-props.ts**: Add export
  - **dashboard-schema.ts**: Update import, DashboardPanel
  - **index.ts**: Update export
  - **layout-schema.ts**: Add import, export
  - **layout-type.ts**: Update LayoutType
  - **dashboard-schema.ts**: Update import, dashboardPanelValidator, dashboardSchemaValidator
  - **index.ts**: Add export
  - **layout-schema.ts**: Update const, export, stackConfigValidator, layoutSchemaValidator
  - **schema-dashboard.tsx**: Add SchemaDashboard, panelLayout, handleTabChange and 6 more
  - **stack-layout.tsx**: Add CSSProperties, ReactNode, StackLayoutProps and 12 more
  - **stack-config.ts**: Add StackConfig
  - **stack-layout.ts**: Add stackConfigSchema, stackLayoutSchema, validateStackLayout, result
