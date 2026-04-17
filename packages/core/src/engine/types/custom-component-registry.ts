import type { ComponentType } from 'react'

/**
 * Registry for user-defined components in layout regions.
 *
 * NOTE: Uses ComponentType<any> to allow registering components with
 * required props. The registry is a generic injection point — narrowing
 * to Record<string, unknown> would prevent components with typed props
 * from being registered. This is an intentional upstream type exception.
 */
export interface CustomComponentRegistry {
  // biome-ignore lint/suspicious/noExplicitAny: generic injection point — typed props vary per consumer
  readonly [componentKey: string]: ComponentType<any>
}
