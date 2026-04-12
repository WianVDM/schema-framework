import type { DashboardSchema } from './dashboard-schema'

/** Props for the SchemaDashboard renderer */
export interface DashboardRendererProps {
  readonly schema: DashboardSchema
  readonly onRegionResize?: (regionId: string, newSizes: Readonly<Record<string, number>>) => void
  readonly onPanelCollapse?: (regionId: string, collapsed: boolean) => void
}
