import { z } from 'zod'
import type { LayoutSchema } from '../types/layout-schema'
import type { ValidationResult } from './shared-schemas'

/** Zod schema for responsive column configuration */
const responsiveColumnsSchema = z
  .object({
    sm: z.number().int().positive().optional(),
    md: z.number().int().positive().optional(),
    lg: z.number().int().positive().optional(),
    xl: z.number().int().positive().optional(),
  })
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Responsive columns must specify at least one breakpoint',
  })

/** Zod schema for card grid configuration constraints */
const cardGridConfigSchema = z
  .object({
    columns: z.union([z.number().int().positive().min(1), responsiveColumnsSchema]).optional(),
    gap: z.union([z.number().min(0), z.string()]).optional(),
    padding: z.union([z.number().min(0), z.string()]).optional(),
  })
  .strict()
  .optional()

/** Zod schema for card-specific layout constraints */
export const cardLayoutSchema = z
  .object({
    type: z.literal('card'),
    regions: z.array(z.unknown()).min(1, 'Card layout requires at least one region'),
    cardGridConfig: cardGridConfigSchema,
  })
  .superRefine(validateCardConstraints)

/** Validates card grid-specific constraints */
function validateCardConstraints(
  data: { type: 'card'; regions: unknown[] },
  ctx: z.RefinementCtx,
): void {
  // NOTE: Each region must have a unique id for card items
  const ids = extractIds(data.regions)
  const seen = new Set<string>()
  for (const entry of ids) {
    if (seen.has(entry.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate region id "${entry.id}" at regions[${entry.index}]`,
        path: ['regions', entry.index, 'id'],
      })
    }
    seen.add(entry.id)
  }
}

/** IdEntry paired with its original index */
interface IdEntry {
  readonly id: string
  readonly index: number
}

/** Extracts id values from region objects, preserving original indices */
function extractIds(regions: unknown[]): IdEntry[] {
  const entries: IdEntry[] = []
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i]
    if (typeof region === 'object' && region !== null && 'id' in region) {
      const id = (region as Record<string, unknown>).id
      if (typeof id === 'string') {
        entries.push({ id, index: i })
      }
    }
  }
  return entries
}

/** Runtime validation for card layout constraints */
export function validateCardLayout(schema: LayoutSchema): ValidationResult {
  if (schema.type !== 'card') {
    return { success: false, errors: ['Schema type must be "card"'] }
  }

  const errors: string[] = []
  const regionIds = schema.regions.map(r => r.id)

  // NOTE: Check for duplicate region IDs
  const seen = new Set<string>()
  for (let i = 0; i < regionIds.length; i++) {
    if (seen.has(regionIds[i])) {
      errors.push(`Duplicate region id "${regionIds[i]}" at regions[${i}]`)
    }
    seen.add(regionIds[i])
  }

  // NOTE: Validate column config
  if (schema.cardGridConfig?.columns !== undefined) {
    if (typeof schema.cardGridConfig.columns === 'number' && schema.cardGridConfig.columns < 1) {
      errors.push('Card grid columns must be at least 1')
    }
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}
