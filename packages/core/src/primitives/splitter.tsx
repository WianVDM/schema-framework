import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'

function normalizeSizes(
  initialSizes: readonly number[] | undefined,
  panelCount: number,
  defaultSize: number,
): number[] {
  if (panelCount === 0) return []

  // NOTE: Build the raw array from whichever branch applies
  let raw: number[]
  if (initialSizes && initialSizes.length === panelCount) {
    raw = [...initialSizes]
  } else if (initialSizes && initialSizes.length > panelCount) {
    raw = initialSizes.slice(0, panelCount)
  } else if (initialSizes && initialSizes.length < panelCount) {
    raw = [...initialSizes, ...Array(panelCount - initialSizes.length).fill(defaultSize)]
  } else {
    raw = Array(panelCount).fill(defaultSize)
  }

  // NOTE: Normalize so the output always sums to exactly 100 percentage points
  const sum = raw.reduce((a, b) => a + b, 0)
  if (sum === 0) return Array(panelCount).fill(100 / panelCount)
  return raw.map(v => (v / sum) * 100)
}

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
  const childArray = React.Children.toArray(children)
  const panelCount = childArray.length
  const defaultSize = panelCount > 0 ? 100 / panelCount : 0
  const [sizes, setSizes] = useState<number[]>(() =>
    normalizeSizes(initialSizes, panelCount, defaultSize),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const sizesRef = useRef(sizes)
  sizesRef.current = sizes
  const prevInitialSizesRef = useRef<readonly number[] | undefined>(
    initialSizes ? [...initialSizes] : undefined,
  )
  const prevPanelCountRef = useRef(panelCount)
  const dragMoveRef = useRef<((e: globalThis.MouseEvent) => void) | null>(null)
  const dragEndRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (dragMoveRef.current) {
        document.removeEventListener('mousemove', dragMoveRef.current)
      }
      if (dragEndRef.current) {
        document.removeEventListener('mouseup', dragEndRef.current)
      }
    }
  }, [])

  const handleDragStart = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      const isHorizontal = direction === 'horizontal'
      const totalSize = isHorizontal ? container.offsetWidth : container.offsetHeight

      // NOTE: Bail out if the container has no measurable size to avoid division-by-zero
      if (totalSize <= 0) return

      const startPos = isHorizontal ? e.clientX : e.clientY

      // NOTE: Snapshot sizes at drag start so handleDragMove uses a stable base
      const startSizes = [...sizesRef.current]

      const handleDragMove = (moveEvent: globalThis.MouseEvent) => {
        const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY
        const diff = currentPos - startPos
        // NOTE: Convert pixel difference to percentage points of the total container
        const percentDiff = (diff / totalSize) * 100

        // NOTE: Clamp the delta so both panels stay within [minPct, maxPct] simultaneously.
        // This preserves the sum-invariant (newSizes[index] + newSizes[index+1] stays constant).
        const minPct = (minSize / totalSize) * 100
        const maxPct = (maxSize / totalSize) * 100

        const leftMin = minPct - startSizes[index]
        const leftMax = maxPct - startSizes[index]
        const rightMin = startSizes[index + 1] - maxPct
        const rightMax = startSizes[index + 1] - minPct

        // NOTE: If constraints conflict (no feasible delta range), skip this move event
        if (Math.max(leftMin, rightMin) > Math.min(leftMax, rightMax)) return

        const allowedDelta = Math.min(
          Math.max(percentDiff, Math.max(leftMin, rightMin)),
          Math.min(leftMax, rightMax),
        )

        const newSizes = [...startSizes]
        newSizes[index] = startSizes[index] + allowedDelta
        newSizes[index + 1] = startSizes[index + 1] - allowedDelta
        setSizes(newSizes)
        onResize?.(newSizes)
      }

      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
        dragMoveRef.current = null
        dragEndRef.current = null
      }

      dragMoveRef.current = handleDragMove
      dragEndRef.current = handleDragEnd

      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
    },
    [direction, minSize, maxSize, onResize],
  )

  useEffect(() => {
    // NOTE: Detect any change including transitions to/from undefined
    const initialSizesChanged =
      JSON.stringify(initialSizes) !== JSON.stringify(prevInitialSizesRef.current)
    const panelCountChanged = panelCount !== prevPanelCountRef.current

    if (initialSizesChanged || panelCountChanged) {
      prevInitialSizesRef.current = initialSizes ? [...initialSizes] : undefined
      prevPanelCountRef.current = panelCount
      setSizes(normalizeSizes(initialSizes, panelCount, defaultSize))
    }
  }, [initialSizes, panelCount, defaultSize])

  const isHorizontal = direction === 'horizontal'

  // NOTE: Compute container size for ARIA range calculations (percentage-based constraints)
  const [containerSize, setContainerSize] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setContainerSize(isHorizontal ? container.offsetWidth : container.offsetHeight)

    const observer = new ResizeObserver(() => {
      setContainerSize(isHorizontal ? container.offsetWidth : container.offsetHeight)
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [isHorizontal])

  const ariaMinPct = containerSize > 0 ? (minSize / containerSize) * 100 : 0

  const handleKeyDown = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: NOTE: Keyboard handler requires multi-key switch + state math; extraction would only move complexity
    (index: number) => (e: React.KeyboardEvent) => {
      const container = containerRef.current
      if (!container) return

      const totalSize = isHorizontal ? container.offsetWidth : container.offsetHeight
      const step = 2 // 2 percentage points per key press
      const pageStep = 10 // 10 percentage points per PageUp/Down

      let delta = 0
      switch (e.key) {
        case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
          delta = -step
          break
        case isHorizontal ? 'ArrowRight' : 'ArrowDown':
          delta = step
          break
        case 'Home':
          delta = -sizesRef.current[index]
          break
        case 'End': {
          const neighborSize = sizesRef.current[index + 1] ?? 0
          delta = neighborSize
          break
        }
        case 'PageUp':
          delta = -pageStep
          break
        case 'PageDown':
          delta = pageStep
          break
        default:
          return
      }

      e.preventDefault()
      const currentSizes = [...sizesRef.current]
      const minPct = (minSize / totalSize) * 100
      const maxPct = (maxSize / totalSize) * 100

      const leftMin = minPct - currentSizes[index]
      const rightMin = currentSizes[index + 1] - maxPct
      const leftMax = maxPct - currentSizes[index]
      const rightMax = currentSizes[index + 1] - minPct

      const allowedDelta = Math.min(
        Math.max(delta, Math.max(leftMin, rightMin)),
        Math.min(leftMax, rightMax),
      )

      if (Math.abs(allowedDelta) < 0.01) return

      currentSizes[index] += allowedDelta
      currentSizes[index + 1] -= allowedDelta
      setSizes(currentSizes)
      onResize?.(currentSizes)
    },
    [isHorizontal, minSize, maxSize, onResize],
  )

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {childArray.map((child, index) => {
        const childKey = (child as React.ReactElement)?.key ?? index
        return (
          <Fragment key={childKey}>
            <div style={{ flex: `${sizes[index]} 0 0`, overflow: 'hidden' }}>{child}</div>
            {index < panelCount - 1 && (
              <div
                onMouseDown={handleDragStart(index)}
                onKeyDown={handleKeyDown(index)}
                tabIndex={0}
                className={`flex-shrink-0 ${
                  isHorizontal
                    ? 'w-1 cursor-col-resize hover:bg-primary/20'
                    : 'h-1 cursor-row-resize hover:bg-primary/20'
                } bg-border transition-colors`}
                role="separator"
                aria-label={`Resize panel ${index + 1} and panel ${index + 2}`}
                aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                aria-valuenow={sizes[index]}
                aria-valuemin={Math.max(
                  ariaMinPct,
                  // NOTE: Account for neighbor panel's maxSize constraint
                  sizes[index] +
                    (sizes[index + 1] ?? 0) -
                    (containerSize > 0 ? (maxSize / containerSize) * 100 : 100),
                )}
                aria-valuemax={Math.max(
                  Math.min(
                    sizes[index] + (sizes[index + 1] ?? 0) - ariaMinPct,
                    containerSize > 0 ? (maxSize / containerSize) * 100 : 100,
                  ),
                  ariaMinPct,
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
