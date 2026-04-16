---
"@my-framework/core": minor
---

Add layout system types, validators, primitives, contexts, and helpers

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