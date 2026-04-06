---
"@my-framework/core": patch
---

feat(grid): add virtualized scrolling with @tanstack/react-virtual integration

- Add `containerHeight` to `VirtualScrollConfig` for configurable scroll container height
- Apply `.strict()` to `virtualScrollConfigSchema` Zod validator to reject unknown properties
- Fix server pagination UI rendering when virtual scroll is enabled
- Use schema-driven container height with fallback to default 600px
- Add immutable query cache settings to virtual grid demo route
