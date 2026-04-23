import type { ComponentType } from "react";

/**
 * Type alias for layout primitive component slots.
 *
 * NOTE: ComponentType<any> is intentional here. These slots accept shadcn components
 * which have varying prop signatures. Narrowing would create false type safety.
 */
// biome-ignore lint/suspicious/noExplicitAny: shadcn components have varying prop signatures
type AnyComponent = ComponentType<any>;

/**
 * Layout-specific primitive interface, separate from core PrimitiveComponents.
 * All slots are optional — layout renderers must check availability and provide fallbacks.
 */
export interface LayoutPrimitiveComponents {
	readonly Panel?: AnyComponent;
	readonly Splitter?: AnyComponent;
	readonly Tabs?: AnyComponent;
	readonly TabsList?: AnyComponent;
	readonly TabsTrigger?: AnyComponent;
	readonly TabsContent?: AnyComponent;
	readonly Accordion?: AnyComponent;
	readonly AccordionItem?: AnyComponent;
	readonly AccordionTrigger?: AnyComponent;
	readonly AccordionContent?: AnyComponent;
	readonly Card?: AnyComponent;
	readonly CardHeader?: AnyComponent;
	readonly CardTitle?: AnyComponent;
	readonly CardContent?: AnyComponent;
	readonly Separator?: AnyComponent;
	readonly Collapsible?: AnyComponent;
	readonly ScrollArea?: AnyComponent;
	readonly ResizablePanelGroup?: AnyComponent;
	readonly ResizablePanel?: AnyComponent;
	readonly ResizableHandle?: AnyComponent;
}
