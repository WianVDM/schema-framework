import type { LayoutSchema } from './layout-schema'
import type { RegionResizeHandler } from './region-resize-handler'
import type { PanelCollapseHandler } from './panel-collapse-handler'

/** Props for the SchemaLayout renderer */
export interface LayoutRendererProps {
  readonly schema: LayoutSchema
  readonly onRegionResize?: RegionResizeHandler
  readonly onPanelCollapse?: PanelCollapseHandler
}