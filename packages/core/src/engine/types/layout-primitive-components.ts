import type { ComponentType } from 'react'

/**
 * Type alias for layout primitive component slots.
 *
 * NOTE: ComponentType<any> is intentional here. These slots accept shadcn components
 * which have varying prop signatures. Narrowing would create false type safety.
 */
// biome-ignore lint/suspicious/noExplicitAny: shadcn components have varying prop signatures
type AnyComponent = ComponentType<any>

/**
 * Layout-specific primitive interface, separate from core PrimitiveComponents.
 * All slots are optional — layout renderers must check availability and provide fallbacks.
 */
export interface LayoutPrimitiveComponents {
  readonly Panel?: AnyComponent
  readonly Splitter?: AnyComponent
  readonly Tabs?: AnyComponent
  readonly Accordion?: AnyComponent
  readonly Card?: AnyComponent
  readonly Separator?: AnyComponent
  readonly Collapsible?: AnyComponent
  readonly ScrollArea?: AnyComponent
  readonly ResizablePanelGroup?: AnyComponent
  readonly ResizablePanel?: AnyComponent
  readonly ResizableHandle?: AnyComponent
}
