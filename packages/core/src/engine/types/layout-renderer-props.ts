import type { LayoutSchema } from './layout-schema'

/** Props for the SchemaLayout renderer */
export interface LayoutRendererProps {
  readonly schema: LayoutSchema
  readonly onRegionResize?: (regionId: string, newSizes: Readonly<Record<string, number>>) => void
  readonly onPanelCollapse?: (regionId: string, collapsed: boolean) => void
}