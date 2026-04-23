import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { LayoutPrimitiveComponents } from "../types";

const layoutPrimitivesDefaultValue: LayoutPrimitiveComponents = {
	Panel: undefined,
	Splitter: undefined,
	Tabs: undefined,
	TabsList: undefined,
	TabsTrigger: undefined,
	TabsContent: undefined,
	Accordion: undefined,
	AccordionItem: undefined,
	AccordionTrigger: undefined,
	AccordionContent: undefined,
	Card: undefined,
	CardHeader: undefined,
	CardTitle: undefined,
	CardContent: undefined,
	Separator: undefined,
	Collapsible: undefined,
	ScrollArea: undefined,
	ResizablePanelGroup: undefined,
	ResizablePanel: undefined,
	ResizableHandle: undefined,
};

export const LayoutPrimitivesContext = createContext<LayoutPrimitiveComponents>(
	layoutPrimitivesDefaultValue,
);
LayoutPrimitivesContext.displayName = "LayoutPrimitivesContext";

export function LayoutPrimitivesProvider({
	primitives,
	children,
}: {
	primitives: LayoutPrimitiveComponents;
	children: ReactNode;
}) {
	return (
		<LayoutPrimitivesContext.Provider value={primitives}>
			{children}
		</LayoutPrimitivesContext.Provider>
	);
}

export function useLayoutPrimitives(): LayoutPrimitiveComponents {
	return useContext(LayoutPrimitivesContext);
}
