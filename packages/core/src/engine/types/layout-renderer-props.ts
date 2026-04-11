import type { LayoutSchema } from './layout-schema'
import type { DashboardSchema } from './dashboard-schema'
import type { TabSchema } from './tab-schema'
import type { ContentSchema } from './content-schema'
import type { CustomComponentRegistry } from './custom-component-registry'

/** Props for the SchemaLayout renderer */
export interface LayoutRendererProps {
  readonly schema: LayoutSchema
  readonly onRegionResize?: (regionId: string, newSizes: Readonly<Record<string, number>>) => void
  readonly onPanelCollapse?: (regionId: string, collapsed: boolean) => void
}

/** Props for the SchemaDashboard renderer */
export interface DashboardRendererProps {
  readonly schema: DashboardSchema
  readonly onRegionResize?: (regionId: string, newSizes: Readonly<Record<string, number>>) => void
  readonly onPanelCollapse?: (regionId: string, collapsed: boolean) => void
}

/** Props for the SchemaTabs renderer */
export interface TabsRendererProps {
  readonly schema: TabSchema
  readonly onTabChange?: (tabId: string) => void
}

/** Props for the ContentRenderer */
export interface ContentRendererProps {
  readonly content: ContentSchema
  readonly customComponents?: CustomComponentRegistry
}