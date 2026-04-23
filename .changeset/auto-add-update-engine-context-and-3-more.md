---
"@my-framework/core": patch
---
Add layout renderers (accordion, card, box, tabs) with engine context, validators, and type exports

**Areas:** engine/context, engine/renderers, engine/types and 1 more

**Affected symbols:** const, import, export, function, AccordionLayoutProps, AccordionLayoutRenderer and 59 more

- **layout-primitives-context.tsx**: Add const
- **content-renderer.tsx**: Update import, export, const
- **index.ts**: Add export
- **schema-layout.tsx**: Update import, export, function
- **index.ts**: Add changes in engine/types
- **layout-primitive-components.ts**: Add export
- **layout-schema.ts**: Add import
- **tab-schema.ts**: Add import
- **index.ts**: Fix export
- **layout-schema.ts**: Add export
- **tab-schema.ts**: Add export
- **accordion-layout.tsx**: Add AccordionLayoutProps, AccordionLayoutRenderer, mode and 11 more
- **box-layout.tsx**: Add BoxLayoutProps, BoxLayoutRenderer, containerStyle and 4 more
- **card-layout.tsx**: Add CardLayoutProps, CardLayoutRenderer, gridStyle and 4 more
- **schema-tabs.tsx**: Add SchemaTabs, mountedTabs, handleTabChange and 3 more
- **accordion-config.ts**: Add AccordionConfig
- **box-config.ts**: Add BoxConfig
- **card-grid-config.ts**: Add CardGridResponsiveColumns, CardGridConfig
- **accordion-layout.ts**: Add accordionConfigSchema, accordionLayoutSchema, validateAccordionConstraints and 12 more
- **box-layout.ts**: Add boxConfigSchema, hboxLayoutSchema, vboxLayoutSchema and 4 more
- **card-layout.ts**: Add responsiveColumnsSchema, cardGridConfigSchema, cardLayoutSchema and 11 more
