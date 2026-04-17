import type { LayoutSchema } from './layout-schema'
import type { PanelCollapseHandler } from './panel-collapse-handler'
import type { RegionResizeHandler } from './region-resize-handler'

/** Props for the SchemaLayout renderer */
export interface LayoutRendererProps {
  readonly schema: LayoutSchema
  readonly onRegionResize?: RegionResizeHandler
  readonly onPanelCollapse?: PanelCollapseHandler
}
