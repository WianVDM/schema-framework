---
"@my-framework/core": minor
---

Add layout system renderers: ContentRenderer, SchemaPanel, SchemaLayout with border layout support

- **ContentRenderer**: Central dispatcher for all 6 ContentSchema variants (form, grid, wizard, tabs, layout, custom)
- **SchemaPanel**: Engine renderer wrapping Panel primitive with LayoutRegion config
- **SchemaLayout**: Border layout renderer (N/S/E/W/C regions) with resizable panels and collapse/expand
- **BorderPosition type**: String literal union for border layout positions
- **validateBorderLayout**: Zod validator for border layout constraints (exactly one center, no duplicates)
- **useResponsiveCollapse**: Runtime hook using matchMedia for responsive panel collapse
- **LayoutPrimitiveComponents**: Extended with ResizablePanelGroup, ResizablePanel, ResizableHandle slots
- **Showcase**: Added mock border layout data and `/demo-border-layout` demo route
- **Versioning**: Corrected to Option C (version core only, showcase = 0.0.0-dev)