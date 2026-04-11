import type { ResponsiveConfig } from '../types/responsive-config'

/** Maps ResponsiveConfig to Tailwind utility classes */
export function applyResponsiveClasses(config: ResponsiveConfig): string {
  const classes: string[] = []

  if (config.hiddenBelow !== undefined) {
    classes.push(`hidden@[${config.hiddenBelow}px]`)
  }

  if (config.collapsedBelow !== undefined) {
    classes.push(`@[${config.collapsedBelow}px]:hidden`)
  }

  if (config.stackBelow !== undefined) {
    classes.push(`@[${config.stackBelow}px]:flex-col`)
  }

  return classes.join(' ')
}