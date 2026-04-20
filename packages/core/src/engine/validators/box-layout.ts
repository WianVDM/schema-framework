import { z } from 'zod'
import type { LayoutSchema } from '../types/layout-schema'
import type { ValidationResult } from './shared-schemas'

/** Zod schema for box flex configuration constraints */
const boxConfigSchema = z
  .object({
    gap: z.union([z.number().min(0), z.string()]).optional(),
    align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
    justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).optional(),
    wrap: z.boolean().optional(),
    padding: z.union([z.number().min(0), z.string()]).optional(),
  })
  .strict()
  .optional()

/** Zod schema for hbox-specific layout constraints */
export const hboxLayoutSchema = z.object({
  type: z.literal('hbox'),
  regions: z.array(z.unknown()).min(1, 'HBox layout requires at least one region'),
  boxConfig: boxConfigSchema,
})

/** Zod schema for vbox-specific layout constraints */
export const vboxLayoutSchema = z.object({
  type: z.literal('vbox'),
  regions: z.array(z.unknown()).min(1, 'VBox layout requires at least one region'),
  boxConfig: boxConfigSchema,
})

/** Runtime validation for hbox/vbox layout constraints */
export function validateBoxLayout(schema: LayoutSchema): ValidationResult {
  if (schema.type !== 'hbox' && schema.type !== 'vbox') {
    return { success: false, errors: ['Schema type must be "hbox" or "vbox"'] }
  }

  const errors: string[] = []

  // NOTE: Validate each region id and check for duplicates
  const seen = new Set<string>()
  for (let i = 0; i < schema.regions.length; i++) {
    const region = schema.regions[i] as unknown
    if (region === null || typeof region !== 'object') {
      errors.push(`Invalid region at regions[${i}] — expected an object`)
      continue
    }
    const id = (region as Record<string, unknown>).id
    if (typeof id !== 'string') {
      errors.push(`Missing or non-string region id at regions[${i}]`)
      continue
    }
    if (seen.has(id)) {
      errors.push(`Duplicate region id "${id}" at regions[${i}]`)
    }
    seen.add(id)
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}
