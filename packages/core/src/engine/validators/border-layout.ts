import { z } from 'zod'
import type { BorderPosition } from '../types/border-position'
import type { LayoutSchema } from '../types/layout-schema'
import type { ValidationResult } from './shared-schemas'

/** Default size percentages for border layout regions */
export const BORDER_DEFAULT_SIZES: Readonly<Record<BorderPosition, number>> = {
  north: 20,
  south: 20,
  east: 20,
  west: 20,
  center: -1,
} as const

/** Valid border position values for validation */
const VALID_BORDER_POSITIONS: ReadonlySet<string> = new Set<BorderPosition>([
  'north',
  'south',
  'east',
  'west',
  'center',
])

/** Zod schema for border-specific layout constraints */
export const borderLayoutSchema = z
  .object({
    type: z.literal('border'),
    regions: z.array(z.unknown()).min(1).refine(isValidBorderRegions, {
      message:
        'Border layout requires exactly one center region with valid positions and no duplicates',
    }),
  })
  .superRefine(validateBorderConstraints)

/** Validates that border regions have valid positions, no duplicates, and exactly one center */
function isValidBorderRegions(regions: unknown[]): boolean {
  const positions = extractPositions(regions)
  if (positions.length === 0) return false

  for (const pos of positions) {
    if (!VALID_BORDER_POSITIONS.has(pos)) return false
  }

  const uniquePositions = new Set(positions)
  if (uniquePositions.size !== positions.length) return false

  const centerCount = positions.filter(p => p === 'center').length
  return centerCount === 1
}

/** Extracts position values from region objects */
function extractPositions(regions: unknown[]): string[] {
  const positions: string[] = []
  for (const region of regions) {
    if (typeof region === 'object' && region !== null && 'position' in region) {
      const pos = (region as Record<string, unknown>).position
      if (typeof pos === 'string') {
        positions.push(pos)
      }
    }
  }
  return positions
}

/** Additional constraint validation for border layouts */
function validateBorderConstraints(
  data: { type: 'border'; regions: unknown[] },
  ctx: z.RefinementCtx,
): void {
  const positions = extractPositions(data.regions)

  // NOTE: Validate each position is a valid BorderPosition
  for (let i = 0; i < positions.length; i++) {
    if (!VALID_BORDER_POSITIONS.has(positions[i])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid border position "${positions[i]}" at regions[${i}]. Must be one of: north, south, east, west, center`,
        path: ['regions', i, 'position'],
      })
    }
  }

  // NOTE: Check for duplicate positions
  const seen = new Set<string>()
  for (let i = 0; i < positions.length; i++) {
    if (seen.has(positions[i])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate position "${positions[i]}" at regions[${i}]`,
        path: ['regions', i, 'position'],
      })
    }
    seen.add(positions[i])
  }

  // NOTE: Exactly one center is required
  const centerCount = positions.filter(p => p === 'center').length
  if (centerCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Border layout requires exactly one region with position "center"',
      path: ['regions'],
    })
  } else if (centerCount > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Border layout requires exactly one "center" region, found ${centerCount}`,
      path: ['regions'],
    })
  }
}

/** Runtime validation for border layout constraints */
export function validateBorderLayout(schema: LayoutSchema): ValidationResult {
  if (schema.type !== 'border') {
    return { success: false, errors: ['Schema type must be "border"'] }
  }

  const errors: string[] = []
  const positions = schema.regions.map(r => r.position)

  // NOTE: Validate positions are valid BorderPosition values
  for (let i = 0; i < positions.length; i++) {
    if (!VALID_BORDER_POSITIONS.has(positions[i])) {
      errors.push(
        `Invalid border position "${positions[i]}" at regions[${i}]. Must be one of: north, south, east, west, center`,
      )
    }
  }

  // NOTE: Check for duplicate positions
  const seen = new Set<string>()
  for (let i = 0; i < positions.length; i++) {
    if (seen.has(positions[i])) {
      errors.push(`Duplicate position "${positions[i]}" at regions[${i}]`)
    }
    seen.add(positions[i])
  }

  // NOTE: Exactly one center is required
  const centerCount = positions.filter(p => p === 'center').length
  if (centerCount === 0) {
    errors.push('Border layout requires exactly one region with position "center"')
  } else if (centerCount > 1) {
    errors.push(`Border layout requires exactly one "center" region, found ${centerCount}`)
  }

  return errors.length === 0 ? { success: true, errors: [] } : { success: false, errors }
}
