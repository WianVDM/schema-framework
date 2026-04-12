import type { ResponsiveConfig } from '../types/responsive-config'

/** Maps ResponsiveConfig to Tailwind utility classes */
export function applyResponsiveClasses(config: ResponsiveConfig): string {
  const classes: string[] = []

  if (config.hiddenBelow !== undefined) {
    classes.push(`max-[${config.hiddenBelow}px]:hidden`)
  }

  if (config.collapsedBelow !== undefined) {
    classes.push(`max-[${config.collapsedBelow}px]:hidden`)
  }

  if (config.stackBelow !== undefined) {
    classes.push(`max-[${config.stackBelow}px]:flex-col`)
  }

  return classes.join(' ')
}