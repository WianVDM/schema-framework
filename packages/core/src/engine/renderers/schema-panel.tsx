import type { ReactNode } from 'react'
import { useLayoutPrimitives } from '../context/layout-primitives-context'
import type { LayoutRegion } from '../types/layout-region'
import type { PanelCollapseHandler } from '../types/panel-collapse-handler'
import { ContentRenderer } from './content-renderer'

interface SchemaPanelProps {
  readonly region: LayoutRegion
  readonly onCollapse?: PanelCollapseHandler
}

/** Engine renderer that wraps Panel primitive with LayoutRegion config */
export function SchemaPanel({ region, onCollapse }: SchemaPanelProps): ReactNode {
  const { Panel } = useLayoutPrimitives()

  const handleCollapse = (collapsed: boolean) => {
    onCollapse?.(region.id, collapsed)
  }

  // NOTE: If no Panel primitive is injected, render content directly in a styled div
  if (!Panel) {
    return (
      <div
        className={`flex flex-col ${region.className ?? ''}`}
        data-region-id={region.id}
        data-region-position={region.position}
      >
        {region.title && (
          <div className="px-3 py-2 text-sm font-medium border-b">{region.title}</div>
        )}
        <div className={`flex-1 ${region.scrollable ? 'overflow-auto' : ''}`}>
          <ContentRenderer content={region.content} />
        </div>
      </div>
    )
  }

  return (
    <Panel
      title={region.title}
      collapsible={region.collapsible}
      collapsed={region.collapsed}
      onCollapse={handleCollapse}
      scrollable={region.scrollable}
      className={region.className}
    >
      <ContentRenderer content={region.content} />
    </Panel>
  )
}
