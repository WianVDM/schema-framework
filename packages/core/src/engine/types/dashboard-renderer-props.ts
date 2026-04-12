import type { DashboardSchema } from './dashboard-schema'
import type { RegionResizeHandler } from './region-resize-handler'
import type { PanelCollapseHandler } from './panel-collapse-handler'

/** Props for the SchemaDashboard renderer */
export interface DashboardRendererProps {
  readonly schema: DashboardSchema
  readonly onRegionResize?: RegionResizeHandler
  readonly onPanelCollapse?: PanelCollapseHandler
}
