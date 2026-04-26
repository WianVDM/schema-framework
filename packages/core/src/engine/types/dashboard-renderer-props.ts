import type { DashboardSchema } from "./dashboard-schema";
import type { PanelCollapseHandler } from "./panel-collapse-handler";
import type { RegionResizeHandler } from "./region-resize-handler";

/** Props for the SchemaDashboard renderer */
export interface DashboardRendererProps {
	readonly schema: DashboardSchema;
	readonly onRegionResize?: RegionResizeHandler;
	readonly onPanelCollapse?: PanelCollapseHandler;
	/** Called when the active panel changes (for tabs/border panelLayout) */
	readonly onActivePanelChange?: (panelId: string) => void;
}
