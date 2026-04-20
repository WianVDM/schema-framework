import { z } from 'zod'
import type { CardGridResponsiveColumns } from '../types/card-grid-config'
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
function extractIds(regions: readonly unknown[]): IdEntry[] {
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
  const ids = extractIds(schema.regions)

  // NOTE: Check for duplicate region IDs
  const seen = new Set<string>()
  for (const entry of ids) {
    if (seen.has(entry.id)) {
      errors.push(`Duplicate region id "${entry.id}" at regions[${entry.index}]`)
    }
    seen.add(entry.id)
  }

  // NOTE: Validate column config — fixed number or responsive breakpoints
  if (schema.cardGridConfig?.columns !== undefined) {
    validateColumns(schema.cardGridConfig.columns, errors)
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}

/** Validates column configuration — fixed number or responsive breakpoints */
function validateColumns(columns: number | CardGridResponsiveColumns, errors: string[]): void {
  if (typeof columns === 'number') {
    if (columns < 1) {
      errors.push('Card grid columns must be at least 1')
    }
    return
  }

  // NOTE: Responsive breakpoints — at least one required, all values positive integers
  const breakpoints = columns as Readonly<Record<string, number | undefined>>
  const keys = Object.keys(breakpoints)
  if (keys.length === 0) {
    errors.push('Responsive card grid must have at least one breakpoint')
  }
  for (const key of keys) {
    const value = breakpoints[key]
    if (value === undefined) {
      errors.push(
        `Card grid columns for breakpoint "${key}" must be defined and a positive integer`,
      )
    } else if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      errors.push(`Card grid columns for breakpoint "${key}" must be a positive integer >= 1`)
    }
  }
}
