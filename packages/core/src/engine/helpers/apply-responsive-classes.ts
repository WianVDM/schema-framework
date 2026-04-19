import type { ResponsiveConfig } from '../types/responsive-config'

/** Maps ResponsiveConfig to Tailwind utility classes and responsive metadata */
export function applyResponsiveClasses(config: ResponsiveConfig): string {
  const classes: string[] = []

  if (config.hiddenBelow !== undefined) {
    classes.push(`max-[${config.hiddenBelow}px]:hidden`)
  }

  if (config.collapsedBelow !== undefined) {
    // NOTE: collapsedBelow cannot be expressed as a CSS class — CSS has no mechanism
    // to toggle resizable panel collapse. The SchemaLayout renderer reads this value
    // directly from the schema and uses ResizeObserver/matchMedia to collapse panels.
  }

  if (config.stackBelow !== undefined) {
    classes.push(`max-[${config.stackBelow}px]:flex-col`)
  }

  return classes.join(' ')
}
