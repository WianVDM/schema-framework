import type { ResponsiveConfig } from '../types/responsive-config'

/** Maps ResponsiveConfig to Tailwind utility classes */
export function applyResponsiveClasses(config: ResponsiveConfig): string {
  const classes: string[] = []

  if (config.hiddenBelow !== undefined) {
    classes.push(`max-[${config.hiddenBelow}px]:hidden`)
  }

  if (config.collapsedBelow !== undefined) {
    // TODO: Implement collapsed responsive behavior in Slice 2 (SchemaLayout renderer).
    // Collapsed panels must show their title bar but hide their content body — not fully hidden.
    // The correct approach depends on how the Panel primitive handles collapse state,
    // which is designed when SchemaLayout is built.
  }

  if (config.stackBelow !== undefined) {
    classes.push(`max-[${config.stackBelow}px]:flex-col`)
  }

  return classes.join(' ')
}
