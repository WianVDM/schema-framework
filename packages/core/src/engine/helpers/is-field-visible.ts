import type { FieldSchema } from '../types'
import { evaluateCondition } from '../validators'

/**
 * Evaluates whether a field should be visible based on its `visibleWhen` condition
 * and the current form values. Extracted as a shared helper used by both
 * SchemaWizard and WizardReviewStep.
 */
export function isFieldVisible(
  field: FieldSchema,
  formValues: Record<string, unknown>
): boolean {
  if (!field.visibleWhen) return true
  return evaluateCondition(field.visibleWhen, formValues)
}