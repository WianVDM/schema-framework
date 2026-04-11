import type { ReactNode } from 'react'

/** Props for the Panel primitive (generic container with header/footer/toolbar) */
export interface PanelProps {
  readonly title?: string
  readonly collapsible?: boolean
  readonly collapsed?: boolean
  readonly onCollapse?: (collapsed: boolean) => void
  readonly scrollable?: boolean
  readonly header?: ReactNode
  readonly footer?: ReactNode
  readonly toolbar?: ReactNode
  readonly className?: string
  readonly children: ReactNode
}