import type { TabSchema } from "./tab-schema";

/** Props for the SchemaTabs renderer */
export interface TabsRendererProps {
	readonly schema: TabSchema;
	readonly onTabChange?: (tabId: string) => void;
}
