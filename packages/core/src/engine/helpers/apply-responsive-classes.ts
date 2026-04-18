import type { ResponsiveConfig } from '../types/responsive-config'

/** Maps ResponsiveConfig to Tailwind utility classes and responsive metadata */
export function applyResponsiveClasses(config: ResponsiveConfig): string {
  const classes: string[] = []

  if (config.hiddenBelow !== undefined) {
    classes.push(`max-[${config.hiddenBelow}px]:hidden`)
  }

  if (config.collapsedBelow !== undefined) {
    // NOTE: collapsedBelow uses a data attribute selector. The SchemaLayout renderer
    // applies a `data-collapsed-below` attribute and uses ResizeObserver or matchMedia
    // to toggle panel collapse state at runtime. CSS alone cannot toggle Panel collapse.
    classes.push(`max-[${config.collapsedBelow}px]:border-collapse`)
  }

  if (config.stackBelow !== undefined) {
    classes.push(`max-[${config.stackBelow}px]:flex-col`)
  }

  return classes.join(' ')
}
