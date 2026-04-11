import type { ComponentType } from 'react'

/** Registry for user-defined components in layout regions */
export interface CustomComponentRegistry {
  readonly [componentKey: string]: ComponentType<Readonly<Record<string, unknown>>>
}