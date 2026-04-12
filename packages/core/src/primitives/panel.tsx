import { useState, useCallback } from 'react'

export interface PanelProps {
  readonly title?: string
  readonly collapsible?: boolean
  readonly collapsed?: boolean
  readonly onCollapse?: (collapsed: boolean) => void
  readonly scrollable?: boolean
  readonly header?: React.ReactNode
  readonly footer?: React.ReactNode
  readonly toolbar?: React.ReactNode
  readonly className?: string
  readonly children: React.ReactNode
}

export function Panel({
  title,
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapse,
  scrollable = false,
  header,
  footer,
  toolbar,
  className = '',
  children,
}: PanelProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = controlledCollapsed ?? internalCollapsed

  const handleToggle = useCallback(() => {
    const next = !isCollapsed
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(next)
    }
    onCollapse?.(next)
  }, [isCollapsed, onCollapse, controlledCollapsed])

  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {(title || header || toolbar || collapsible) && (
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {header ?? (
              title && <h3 className="text-sm font-semibold leading-none tracking-tight">{title}</h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            {collapsible && (
              <button
                type="button"
                onClick={handleToggle}
                className="rounded-md p-1 hover:bg-accent transition-colors text-muted-foreground"
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className={`px-4 py-3 ${scrollable ? 'overflow-auto max-h-[500px]' : ''}`}>
          {children}
        </div>
      )}

      {footer && !isCollapsed && (
        <div className="px-4 py-3 border-t">{footer}</div>
      )}
    </div>
  )
}