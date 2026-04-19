import { useCallback, useEffect, useState } from 'react'
import type { LayoutRegion } from '../types/layout-region'

/** Maps region IDs to their collapsed state based on responsive config and viewport width */
export function useResponsiveCollapse(
  regions: readonly LayoutRegion[],
): ReadonlyMap<string, boolean> {
  const computeCollapsed = useCallback((): ReadonlyMap<string, boolean> => {
    const result = new Map<string, boolean>()
    if (typeof window === 'undefined') return result

    const viewportWidth = window.innerWidth

    for (const region of regions) {
      const collapsedBelow = region.responsive?.collapsedBelow
      if (collapsedBelow !== undefined && viewportWidth < collapsedBelow) {
        result.set(region.id, true)
      }
    }

    return result
  }, [regions])

  // NOTE: Initialize with empty Map to avoid SSR/client mismatch (computeCollapsed reads window)
  const [collapsed, setCollapsed] = useState<ReadonlyMap<string, boolean>>(() => new Map())

  useEffect(() => {
    // NOTE: Collect all unique collapsedBelow breakpoints and observe them with matchMedia
    const breakpoints = new Set<number>()
    for (const region of regions) {
      const collapsedBelow = region.responsive?.collapsedBelow
      if (collapsedBelow !== undefined) {
        breakpoints.add(collapsedBelow)
      }
    }

    if (breakpoints.size === 0) return

    // NOTE: Filter invalid breakpoints (≤ 1) to avoid negative/zero media queries
    const validBreakpoints = [...breakpoints].filter(bp => bp > 1 && Number.isFinite(bp))
    if (validBreakpoints.length === 0) return

    const mqls = validBreakpoints.map(bp => window.matchMedia(`(max-width: ${bp - 1}px)`))

    // NOTE: Initial computation on mount
    setCollapsed(computeCollapsed())

    const handlers = mqls.map(mql => {
      const handler = (): void => {
        setCollapsed(computeCollapsed())
      }
      mql.addEventListener('change', handler)
      return handler
    })

    return () => {
      mqls.forEach((mql, i) => {
        mql.removeEventListener('change', handlers[i])
      })
    }
  }, [regions, computeCollapsed])

  return collapsed
}
