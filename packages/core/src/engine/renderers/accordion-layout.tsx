import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useLayoutPrimitives } from '../context/layout-primitives-context'
import type { AccordionConfig, SingleAccordionConfig } from '../types/accordion-config'
import type { LayoutRegion } from '../types/layout-region'
import type { PanelCollapseHandler } from '../types/panel-collapse-handler'
import { ContentRenderer } from './content-renderer'

interface AccordionLayoutProps {
  readonly regions: readonly LayoutRegion[]
  readonly accordionConfig?: AccordionConfig
  readonly onPanelCollapse?: PanelCollapseHandler
}

/** Compares two string arrays by content — avoids reference-equality false positives from re-renders */
function areStringArraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/** Renders accordion layout from LayoutSchema regions using injected Accordion primitives */
export function AccordionLayoutRenderer({
  regions,
  accordionConfig,
  onPanelCollapse,
}: AccordionLayoutProps): ReactNode {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = useLayoutPrimitives()
  const mode = accordionConfig?.mode ?? 'single'
  const collapsible = isSingleConfig(accordionConfig) ? (accordionConfig.collapsible ?? true) : true
  const defaultOpen = normalizeDefaultOpen(accordionConfig)
  const animation = accordionConfig?.animation ?? 'slide'

  // NOTE: Determine accordion type — 'single' allows one item open, 'multiple' allows many
  const accordionType = mode === 'multiple' ? 'multiple' : 'single'

  // NOTE: All hooks (useRef) must be called before any conditional returns
  const prevOpenRef = useRef<ReadonlySet<string>>(new Set(defaultOpen))

  // NOTE: Sync prevOpenRef when defaultOpen content changes externally (e.g. schema update)
  useEffect(() => {
    if (!areStringArraysEqual(defaultOpen, Array.from(prevOpenRef.current))) {
      prevOpenRef.current = new Set(defaultOpen)
    }
  }, [defaultOpen])

  // NOTE: Fallback when Accordion primitives are not injected
  if (!(Accordion && AccordionItem && AccordionTrigger && AccordionContent)) {
    return (
      <FallbackAccordionLayout
        regions={regions}
        defaultOpen={defaultOpen}
        animation={animation}
        mode={mode}
        collapsible={collapsible}
        onPanelCollapse={onPanelCollapse}
      />
    )
  }

  // NOTE: Animation config passed as data attribute for CSS-based animation control
  const animationClass = getAnimationClass(animation)

  // NOTE: Radix single-mode expects string, multiple-mode expects string[]
  const effectiveDefaultValue = accordionType === 'single' ? (defaultOpen[0] ?? '') : defaultOpen

  // NOTE: Handler for collapse events from injected Accordion — fires on both open and close
  const handleValueChange = (value: string | string[]): void => {
    if (!onPanelCollapse) return

    // NOTE: Resolve open IDs from Radix value — handles single/multiple mode differences
    const newOpenIds = resolveOpenIds(value, accordionType)

    const prev = prevOpenRef.current

    // NOTE: Notify newly opened panels
    for (const id of newOpenIds) {
      if (!prev.has(id)) {
        onPanelCollapse(id, true)
      }
    }

    // NOTE: Notify newly closed panels
    for (const id of prev) {
      if (!newOpenIds.has(id)) {
        onPanelCollapse(id, false)
      }
    }

    prevOpenRef.current = newOpenIds
  }

  return (
    <Accordion
      type={accordionType}
      {...(accordionType === 'single' ? { collapsible } : {})}
      defaultValue={effectiveDefaultValue}
      className={animationClass}
      onValueChange={handleValueChange}
    >
      {regions.map(region => (
        <AccordionItem key={region.id} value={region.id}>
          <AccordionTrigger>{region.title ?? region.id}</AccordionTrigger>
          <AccordionContent>
            <ContentRenderer content={region.content} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/** Type guard: only SingleAccordionConfig supports collapsible and string defaultOpen */
function isSingleConfig(config?: AccordionConfig): config is SingleAccordionConfig {
  return config?.mode !== 'multiple'
}

/** Normalizes defaultOpen to a flat string array regardless of config variant */
function normalizeDefaultOpen(config?: AccordionConfig): readonly string[] {
  if (!config) return []
  if (isSingleConfig(config)) {
    return config.defaultOpen ? [config.defaultOpen] : []
  }
  return config.defaultOpen ?? []
}

/** Maps animation config to CSS class names */
function getAnimationClass(animation: 'slide' | 'fade' | 'none'): string {
  switch (animation) {
    case 'fade':
      return 'animate-accordion-fade'
    case 'none':
      return 'animate-none'
    default:
      return ''
  }
}

/** Fallback accordion when primitives are not injected */
function FallbackAccordionLayout({
  regions,
  defaultOpen,
  animation,
  mode,
  collapsible,
  onPanelCollapse,
}: {
  readonly regions: readonly LayoutRegion[]
  readonly defaultOpen: readonly string[]
  readonly animation: 'slide' | 'fade' | 'none'
  readonly mode: 'single' | 'multiple'
  readonly collapsible: boolean
  readonly onPanelCollapse?: PanelCollapseHandler
}): ReactNode {
  // NOTE: State-driven toggle tracking for fallback accordion — no auto-open of first panel
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(defaultOpen))

  const toggleRegion = (regionId: string): void => {
    // NOTE: Use functional updater to avoid stale closure over openIds
    setOpenIds(prev => computeNextOpenIds(prev, regionId, mode, collapsible))
  }

  // NOTE: Track previous openIds for symmetric-diff notification via useEffect
  const prevIdsRef = useRef<ReadonlySet<string>>(openIds)

  // NOTE: Panel element refs for measuring content height — avoids hardcoded maxHeight
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({})

  // NOTE: Measure panel heights via ResizeObserver for accurate CSS transitions.
  // Falls back to synchronous measurement when ResizeObserver is unavailable (e.g. SSR).
  // biome-ignore lint/correctness/useExhaustiveDependencies: regions change triggers re-observation of panel refs
  useEffect(() => {
    const panels = panelRefs.current
    if (typeof ResizeObserver === 'undefined') {
      // NOTE: Fallback synchronous measurement for environments without ResizeObserver
      const heights: Record<string, number> = {}
      for (const [id, el] of panels) {
        heights[id] = el.scrollHeight
      }
      setPanelHeights(prev => {
        const keys = Object.keys(heights)
        const prevKeys = Object.keys(prev)
        if (keys.length !== prevKeys.length) return heights
        return keys.some(k => heights[k] !== prev[k]) ? heights : prev
      })
      return
    }

    const observer = new ResizeObserver(entries => {
      const heights: Record<string, number> = {}
      for (const entry of entries) {
        const el = entry.target as HTMLDivElement
        // NOTE: Find the region ID for this element
        for (const [id, panelEl] of panels) {
          if (panelEl === el) {
            heights[id] = el.scrollHeight
            break
          }
        }
      }
      // NOTE: Merge partial heights into previous state to preserve measurements for unchanged panels
      setPanelHeights(prev => {
        const merged = { ...prev, ...heights }
        return Object.keys(merged).some(k => merged[k] !== prev[k]) ? merged : prev
      })
    })

    for (const [, el] of panels) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [regions])

  // NOTE: Notify onPanelCollapse for every ID whose open state changed — handles single-mode
  // panel swap (close A, open B) that the previous inline approach missed
  useEffect(() => {
    if (!onPanelCollapse) return

    const prev = prevIdsRef.current

    for (const id of openIds) {
      if (!prev.has(id)) {
        onPanelCollapse(id, true)
      }
    }

    for (const id of prev) {
      if (!openIds.has(id)) {
        onPanelCollapse(id, false)
      }
    }

    prevIdsRef.current = openIds
  }, [openIds, onPanelCollapse])

  const handleToggle = (regionId: string): void => {
    toggleRegion(regionId)
  }

  const animationStyle = animation === 'none' ? undefined : { transitionDuration: '200ms' }

  return (
    <div className="divide-y rounded-lg border">
      {regions.map(region => {
        const isOpen = openIds.has(region.id)
        return (
          <div key={region.id} data-region-id={region.id}>
            <button
              id={`trigger-${region.id}`}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`panel-${region.id}`}
              className="flex w-full items-center justify-between p-4 font-medium transition-colors hover:bg-muted/50"
              onClick={() => handleToggle(region.id)}
            >
              {region.title ?? region.id}
              <span
                aria-hidden="true"
                className="h-4 w-4 shrink-0 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▾
              </span>
            </button>
            <div
              id={`panel-${region.id}`}
              ref={el => registerPanelRef(panelRefs, region.id, el)}
              role="region"
              aria-labelledby={`trigger-${region.id}`}
              aria-hidden={!isOpen}
              inert={!isOpen}
              className="overflow-hidden px-4 pb-4"
              style={{
                ...animationStyle,
                maxHeight: getPanelMaxHeight(isOpen, panelHeights[region.id]),
                opacity: animation === 'fade' ? (isOpen ? 1 : 0) : undefined,
              }}
            >
              <ContentRenderer content={region.content} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Resolves open IDs from Radix value change — handles single/multiple mode differences */
function resolveOpenIds(value: string | string[], accordionType: string): ReadonlySet<string> {
  // NOTE: Filter empty strings — Radix passes '' in single-collapsible mode when all panels close
  if (accordionType === 'multiple' && Array.isArray(value)) {
    return new Set<string>(value.filter(v => v !== ''))
  }
  if (typeof value === 'string' && value !== '') {
    return new Set<string>([value])
  }
  return new Set<string>()
}

/** Computes next open ID set after toggling a region — handles single/multiple mode rules */
function computeNextOpenIds(
  prev: ReadonlySet<string>,
  regionId: string,
  mode: 'single' | 'multiple',
  collapsible: boolean,
): ReadonlySet<string> {
  // NOTE: Single-mode + non-collapsible: clicking the already-open panel is a no-op
  if (mode === 'single' && !collapsible && prev.has(regionId)) {
    return prev
  }

  const next = new Set(prev)
  if (next.has(regionId)) {
    next.delete(regionId)
    return next
  }
  if (mode === 'single') {
    next.clear()
  }
  next.add(regionId)
  return next
}

/** Registers a panel DOM element ref for height measurement — cleans up stale entries on unmount */
function registerPanelRef(
  panelRefs: React.MutableRefObject<Map<string, HTMLDivElement>>,
  regionId: string,
  el: HTMLDivElement | null,
): void {
  if (!el) {
    panelRefs.current.delete(regionId)
    return
  }
  panelRefs.current.set(regionId, el)
}

/** Resolves panel maxHeight — undefined lets CSS auto-size, '0px' collapses */
function getPanelMaxHeight(
  isOpen: boolean,
  measuredHeight: number | undefined,
): string | undefined {
  if (!isOpen) return '0px'
  if (measuredHeight === undefined) return undefined
  return `${measuredHeight}px`
}
