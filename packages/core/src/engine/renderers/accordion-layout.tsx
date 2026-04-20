import { type ReactNode, useRef, useState } from 'react'
import { useLayoutPrimitives } from '../context/layout-primitives-context'
import type { AccordionConfig } from '../types/accordion-config'
import type { LayoutRegion } from '../types/layout-region'
import type { PanelCollapseHandler } from '../types/panel-collapse-handler'
import { ContentRenderer } from './content-renderer'

interface AccordionLayoutProps {
  readonly regions: readonly LayoutRegion[]
  readonly accordionConfig?: AccordionConfig
  readonly onPanelCollapse?: PanelCollapseHandler
}

/** Renders accordion layout from LayoutSchema regions using injected Accordion primitives */
export function AccordionLayoutRenderer({
  regions,
  accordionConfig,
  onPanelCollapse,
}: AccordionLayoutProps): ReactNode {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = useLayoutPrimitives()
  const mode = accordionConfig?.mode ?? 'single'
  const collapsible = accordionConfig?.collapsible ?? true
  const defaultOpen = accordionConfig?.defaultOpen ?? []
  const animation = accordionConfig?.animation ?? 'slide'

  // NOTE: Determine accordion type — 'single' allows one item open, 'multiple' allows many
  const accordionType = mode === 'multiple' ? 'multiple' : 'single'

  // NOTE: All hooks (useRef) must be called before any conditional returns
  const prevOpenRef = useRef<ReadonlySet<string>>(new Set(defaultOpen))

  // NOTE: Fallback when Accordion primitives are not injected
  if (!(Accordion && AccordionItem && AccordionTrigger && AccordionContent)) {
    return (
      <FallbackAccordionLayout
        regions={regions}
        defaultOpen={defaultOpen}
        animation={animation}
        mode={mode}
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

    const newOpenIds =
      accordionType === 'multiple' && Array.isArray(value)
        ? new Set<string>(value)
        : typeof value === 'string'
          ? new Set<string>([value])
          : new Set<string>()

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
      collapsible={collapsible}
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
  onPanelCollapse,
}: {
  readonly regions: readonly LayoutRegion[]
  readonly defaultOpen: readonly string[]
  readonly animation: 'slide' | 'fade' | 'none'
  readonly mode: 'single' | 'multiple'
  readonly onPanelCollapse?: PanelCollapseHandler
}): ReactNode {
  // NOTE: State-driven toggle tracking for fallback accordion
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(
    () => new Set(defaultOpen.length > 0 ? defaultOpen : [regions[0]?.id].filter(Boolean)),
  )

  const toggleRegion = (regionId: string): void => {
    // NOTE: Use functional updater to avoid stale closure over openIds
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(regionId)) {
        next.delete(regionId)
      } else if (mode === 'single') {
        next.clear()
        next.add(regionId)
      } else {
        next.add(regionId)
      }
      onPanelCollapse?.(regionId, next.has(regionId))
      return next
    })
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
              onClick={() => toggleRegion(region.id)}
            >
              {region.title ?? region.id}
              <span
                className="h-4 w-4 shrink-0 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▾
              </span>
            </button>
            <div
              id={`panel-${region.id}`}
              role="region"
              aria-labelledby={`trigger-${region.id}`}
              className="overflow-hidden px-4 pb-4"
              style={{
                ...animationStyle,
                maxHeight: isOpen ? '2000px' : '0px',
                opacity: animation === 'fade' ? (isOpen ? 1 : 0) : undefined,
                padding: isOpen ? undefined : '0 1rem',
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
