---
"@my-framework/core": minor
---

Add v0.4.0 Advanced Data Components: SchemaTree, SchemaChart, SchemaTreeGrid, and real-time polling

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