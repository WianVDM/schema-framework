import type { ReactNode } from 'react'
import { useLayoutPrimitives } from '../context/layout-primitives-context'
import type { BorderPosition } from '../types/border-position'
import type { LayoutRegion } from '../types/layout-region'
import type { LayoutRendererProps } from '../types/layout-renderer-props'
import { BORDER_DEFAULT_SIZES } from '../validators/border-layout'
import { SchemaPanel } from './schema-panel'

/** Main layout renderer — dispatches to layout-type-specific renderers */
export function SchemaLayout({
  schema,
  onRegionResize: _onRegionResize,
  onPanelCollapse: _onPanelCollapse,
}: LayoutRendererProps): ReactNode {
  switch (schema.type) {
    case 'border':
      return (
        <BorderLayoutRenderer
          regions={schema.regions}
          onRegionResize={_onRegionResize}
          onPanelCollapse={_onPanelCollapse}
        />
      )
    case 'accordion':
      return <NotImplementedPlaceholder layoutType="accordion" />
    case 'card':
      return <NotImplementedPlaceholder layoutType="card" />
    case 'hbox':
      return <NotImplementedPlaceholder layoutType="hbox" />
    case 'vbox':
      return <NotImplementedPlaceholder layoutType="vbox" />
    default:
      return <ErrorPlaceholder message={`Unknown layout type: ${schema.type}`} />
  }
}

/** Renders border layout with N/S/E/W/C regions using injected resizable panels */
function BorderLayoutRenderer({
  regions,
  onRegionResize: _onRegionResize,
  onPanelCollapse,
}: {
  readonly regions: readonly LayoutRegion[]
  readonly onRegionResize?: import('../types/region-resize-handler').RegionResizeHandler
  readonly onPanelCollapse?: import('../types/panel-collapse-handler').PanelCollapseHandler
}): ReactNode {
  const { ResizablePanelGroup, ResizablePanel, ResizableHandle } = useLayoutPrimitives()

  const categorized = categorizeRegions(regions)

  // NOTE: Fallback when resizable primitives are not injected
  if (!(ResizablePanelGroup && ResizablePanel && ResizableHandle)) {
    return <FallbackBorderLayout categorized={categorized} onPanelCollapse={onPanelCollapse} />
  }

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="vertical">
        {categorized.north && (
          <>
            <ResizablePanel
              defaultSize={getRegionSize(categorized.north, 'north')}
              minSize={extractNumericSize(categorized.north.minSize)}
              maxSize={extractNumericSize(categorized.north.maxSize)}
              collapsible={categorized.north.collapsible}
            >
              <SchemaPanel region={categorized.north} onCollapse={onPanelCollapse} />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        <ResizablePanel defaultSize={getCenterSize(categorized)}>
          <ResizablePanelGroup direction="horizontal">
            {categorized.west && (
              <>
                <ResizablePanel
                  defaultSize={getRegionSize(categorized.west, 'west')}
                  minSize={extractNumericSize(categorized.west.minSize)}
                  maxSize={extractNumericSize(categorized.west.maxSize)}
                  collapsible={categorized.west.collapsible}
                >
                  <SchemaPanel region={categorized.west} onCollapse={onPanelCollapse} />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            <ResizablePanel defaultSize={getCenterHorizontalSize(categorized)}>
              <SchemaPanel region={categorized.center} onCollapse={onPanelCollapse} />
            </ResizablePanel>

            {categorized.east && (
              <>
                <ResizableHandle />
                <ResizablePanel
                  defaultSize={getRegionSize(categorized.east, 'east')}
                  minSize={extractNumericSize(categorized.east.minSize)}
                  maxSize={extractNumericSize(categorized.east.maxSize)}
                  collapsible={categorized.east.collapsible}
                >
                  <SchemaPanel region={categorized.east} onCollapse={onPanelCollapse} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>

        {categorized.south && (
          <>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={getRegionSize(categorized.south, 'south')}
              minSize={extractNumericSize(categorized.south.minSize)}
              maxSize={extractNumericSize(categorized.south.maxSize)}
              collapsible={categorized.south.collapsible}
            >
              <SchemaPanel region={categorized.south} onCollapse={onPanelCollapse} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}

/** Categorizes regions into border positions */
function categorizeRegions(regions: readonly LayoutRegion[]): BorderRegions {
  const result: BorderRegions = { center: regions[0] }

  for (const region of regions) {
    const pos = region.position as BorderPosition
    if (pos === 'north') result.north = region
    else if (pos === 'south') result.south = region
    else if (pos === 'east') result.east = region
    else if (pos === 'west') result.west = region
    else if (pos === 'center') result.center = region
  }

  return result
}

/** Extracts numeric size from a region, falling back to position default */
function getRegionSize(region: LayoutRegion, position: BorderPosition): number {
  if (region.size !== undefined) {
    return typeof region.size === 'number' ? region.size : Number.parseInt(region.size, 10)
  }
  return BORDER_DEFAULT_SIZES[position]
}

/** Calculates center panel size in vertical direction */
function getCenterSize(categorized: BorderRegions): number {
  let used = 0
  if (categorized.north) used += getRegionSize(categorized.north, 'north')
  if (categorized.south) used += getRegionSize(categorized.south, 'south')
  return Math.max(100 - used, 10)
}

/** Calculates center panel size in horizontal direction */
function getCenterHorizontalSize(categorized: BorderRegions): number {
  let used = 0
  if (categorized.west) used += getRegionSize(categorized.west, 'west')
  if (categorized.east) used += getRegionSize(categorized.east, 'east')
  return Math.max(100 - used, 10)
}

/** Extracts numeric value from size prop if numeric */
function extractNumericSize(size: string | number | undefined): number | undefined {
  if (size === undefined) return undefined
  return typeof size === 'number' ? size : Number.parseInt(size, 10)
}

/** Fallback border layout when resizable primitives are not injected */
function FallbackBorderLayout({
  categorized,
  onPanelCollapse,
}: {
  readonly categorized: BorderRegions
  readonly onPanelCollapse?: import('../types/panel-collapse-handler').PanelCollapseHandler
}): ReactNode {
  return (
    <div className="h-full w-full flex flex-col gap-1">
      {categorized.north && (
        <div style={{ height: `${getRegionSize(categorized.north, 'north')}%` }}>
          <SchemaPanel region={categorized.north} onCollapse={onPanelCollapse} />
        </div>
      )}
      <div className="flex-1 flex flex-row gap-1 min-h-0">
        {categorized.west && (
          <div style={{ width: `${getRegionSize(categorized.west, 'west')}%` }}>
            <SchemaPanel region={categorized.west} onCollapse={onPanelCollapse} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <SchemaPanel region={categorized.center} onCollapse={onPanelCollapse} />
        </div>
        {categorized.east && (
          <div style={{ width: `${getRegionSize(categorized.east, 'east')}%` }}>
            <SchemaPanel region={categorized.east} onCollapse={onPanelCollapse} />
          </div>
        )}
      </div>
      {categorized.south && (
        <div style={{ height: `${getRegionSize(categorized.south, 'south')}%` }}>
          <SchemaPanel region={categorized.south} onCollapse={onPanelCollapse} />
        </div>
      )}
    </div>
  )
}

/** Placeholder for not-yet-implemented layout types */
function NotImplementedPlaceholder({ layoutType }: { readonly layoutType: string }): ReactNode {
  return (
    <div className="p-4 border border-dashed rounded-md text-muted-foreground text-sm">
      {layoutType} layout — not yet implemented
    </div>
  )
}

/** Error display for unknown layout types */
function ErrorPlaceholder({ message }: { readonly message: string }): ReactNode {
  return (
    <div className="p-4 border border-destructive/50 rounded-md text-destructive text-sm">
      {message}
    </div>
  )
}

/** Categorized border regions by position */
interface BorderRegions {
  north?: LayoutRegion
  south?: LayoutRegion
  east?: LayoutRegion
  west?: LayoutRegion
  center: LayoutRegion
}
