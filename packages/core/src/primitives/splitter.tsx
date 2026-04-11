import { useState, useCallback, useRef, useEffect, Fragment } from 'react'

export interface SplitterProps {
  readonly direction: 'horizontal' | 'vertical'
  readonly onResize?: (sizes: readonly number[]) => void
  readonly initialSizes?: readonly number[]
  readonly minSize?: number
  readonly maxSize?: number
  readonly className?: string
  readonly children: React.ReactNode
}

export function Splitter({
  direction,
  onResize,
  initialSizes,
  minSize = 50,
  maxSize = 800,
  className = '',
  children,
}: SplitterProps) {
  const childArray = Array.isArray(children) ? children : [children]
  const panelCount = childArray.length
  const defaultSize = 100 / panelCount
  const [sizes, setSizes] = useState<number[]>(
    initialSizes ? [...initialSizes] : Array(panelCount).fill(defaultSize),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      const isHorizontal = direction === 'horizontal'
      const totalSize = isHorizontal ? container.offsetWidth : container.offsetHeight
      const startPos = isHorizontal ? e.clientX : e.clientY

      const handleDragMove = (moveEvent: globalThis.MouseEvent) => {
        const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY
        const diff = currentPos - startPos
        const percentDiff = (diff / totalSize) * defaultSize

        const newSizes = [...sizes]
        const clampedUp = Math.min(Math.max(newSizes[index] + percentDiff, minSize / totalSize * 100), maxSize / totalSize * 100)
        const clampedDown = Math.min(Math.max(newSizes[index + 1] - percentDiff, minSize / totalSize * 100), maxSize / totalSize * 100)

        newSizes[index] = clampedUp
        newSizes[index + 1] = clampedDown
        setSizes(newSizes)
        onResize?.(newSizes)
      }

      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }

      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
    },
    [direction, sizes, minSize, maxSize, defaultSize, onResize],
  )

  useEffect(() => {
    if (initialSizes) {
      setSizes([...initialSizes])
    }
  }, [initialSizes])

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {childArray.map((child, index) => (
        <Fragment key={index}>
          <div style={{ flex: `${sizes[index]} 0 0`, overflow: 'hidden' }}>
            {child}
          </div>
          {index < panelCount - 1 && (
            <div
              onMouseDown={handleDragStart(index)}
              className={`flex-shrink-0 ${
                isHorizontal
                  ? 'w-1 cursor-col-resize hover:bg-primary/20'
                  : 'h-1 cursor-row-resize hover:bg-primary/20'
              } bg-border transition-colors`}
              role="separator"
              aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}