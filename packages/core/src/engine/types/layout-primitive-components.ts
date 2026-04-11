import type { ComponentType } from 'react'

/**
 * Layout-specific primitive interface, separate from core PrimitiveComponents.
 * All slots are optional — layout renderers must check availability and provide fallbacks.
 *
 * NOTE: ComponentType<any> is intentional here. These slots accept shadcn components
 * which have varying prop signatures. Narrowing would create false type safety.
 */
export interface LayoutPrimitiveComponents {
  readonly Panel?: ComponentType<any>
  readonly Splitter?: ComponentType<any>
  readonly Tabs?: ComponentType<any>
  readonly Accordion?: ComponentType<any>
  readonly Card?: ComponentType<any>
  readonly Separator?: ComponentType<any>
  readonly Collapsible?: ComponentType<any>
  readonly ScrollArea?: ComponentType<any>
  readonly ResizablePanelGroup?: ComponentType<any>
  readonly ResizablePanel?: ComponentType<any>
  readonly ResizableHandle?: ComponentType<any>
}