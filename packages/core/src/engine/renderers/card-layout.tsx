import type { CSSProperties, ReactNode } from 'react'
import { useLayoutPrimitives } from '../context/layout-primitives-context'
import type { CardGridConfig } from '../types/card-grid-config'
import type { LayoutRegion } from '../types/layout-region'
import type { PanelCollapseHandler } from '../types/panel-collapse-handler'
import type { RegionResizeHandler } from '../types/region-resize-handler'
import { ContentRenderer } from './content-renderer'

interface CardLayoutProps {
  readonly regions: readonly LayoutRegion[]
  readonly cardGridConfig?: CardGridConfig
  readonly onRegionResize?: RegionResizeHandler
  readonly onPanelCollapse?: PanelCollapseHandler
}

/** Renders card grid layout from LayoutSchema regions using injected Card primitives */
export function CardLayoutRenderer({ regions, cardGridConfig }: CardLayoutProps): ReactNode {
  const { Card, CardHeader, CardTitle, CardContent } = useLayoutPrimitives()
  const gridStyle = buildGridStyle(cardGridConfig)

  // NOTE: Fallback when Card primitives are not injected
  if (!(Card && CardContent)) {
    return <FallbackCardLayout regions={regions} gridStyle={gridStyle} />
  }

  return (
    <div className="grid" style={gridStyle}>
      {regions.map(region => (
        <Card key={region.id}>
          {region.title && CardHeader && CardTitle && (
            <CardHeader>
              <CardTitle>{region.title}</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <ContentRenderer content={region.content} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Builds CSS Grid style from CardGridConfig */
function buildGridStyle(config: CardGridConfig | undefined): CSSProperties {
  if (!config) {
    return { gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }
  }

  const style: CSSProperties = {}

  // NOTE: Column configuration — fixed number or responsive
  if (config.columns === undefined) {
    style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))'
  } else {
    if (typeof config.columns === 'number') {
      style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`
    } else {
      // NOTE: Responsive columns use mobile-first — smallest breakpoint is the default
      const defaultCols = config.columns.sm ?? config.columns.md ?? 1
      style.gridTemplateColumns = `repeat(${defaultCols}, 1fr)`
    }
  }

  if (config.gap === undefined) {
    style.gap = '1rem'
  } else {
    style.gap = typeof config.gap === 'number' ? `${config.gap}px` : config.gap
  }

  if (config.padding !== undefined) {
    style.padding = typeof config.padding === 'number' ? `${config.padding}px` : config.padding
  }

  return style
}

/** Fallback card grid when Card primitives are not injected */
function FallbackCardLayout({
  regions,
  gridStyle,
}: {
  readonly regions: readonly LayoutRegion[]
  readonly gridStyle: CSSProperties
}): ReactNode {
  return (
    <div className="grid" style={gridStyle}>
      {regions.map(region => (
        <div key={region.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          {region.title && (
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">{region.title}</h3>
            </div>
          )}
          <div className="p-6 pt-0">
            <ContentRenderer content={region.content} />
          </div>
        </div>
      ))}
    </div>
  )
}
