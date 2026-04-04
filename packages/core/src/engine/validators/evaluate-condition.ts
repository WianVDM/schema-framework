import type { FieldCondition } from '../types'

export function evaluateCondition(
  condition: Readonly<FieldCondition>,
  formValues: Readonly<Record<string, unknown>>
): boolean {
  const fieldValue = formValues[condition.field]

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value
    case 'notEquals':
      return fieldValue !== condition.value
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue as string | number)
    case 'notIn':
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue as string | number)
    case 'truthy':
      return Boolean(fieldValue)
    case 'falsy':
      return !fieldValue
    default:
      return true
  }
}