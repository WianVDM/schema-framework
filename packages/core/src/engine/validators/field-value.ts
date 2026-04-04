import type { RuntimeValidationRule, FieldSchema } from '../types'

export function validateFieldValue(
  value: unknown,
  field: Readonly<FieldSchema>
): string | null {
  if (!field.validation) return null

  for (const rule of field.validation as readonly RuntimeValidationRule[]) {
    const error = applyRule(value, rule, field)
    if (error != null) return error
  }

  return null
}

function applyRule(
  value: unknown,
  rule: Readonly<RuntimeValidationRule>,
  field: Readonly<FieldSchema>
): string | null {
  switch (rule.type) {
    case 'required':
      if (isEmpty(value)) {
        return rule.message
      }
      break
    case 'min':
      if (typeof value === 'number' && value < (rule.value as number)) {
        return rule.message
      }
      break
    case 'max':
      if (typeof value === 'number' && value > (rule.value as number)) {
        return rule.message
      }
      break
    case 'minLength':
      if (typeof value === 'string' && value.length < (rule.value as number)) {
        return rule.message
      }
      break
    case 'maxLength':
      if (typeof value === 'string' && value.length > (rule.value as number)) {
        return rule.message
      }
      break
    case 'pattern': {
      if (typeof value === 'string' && rule.value) {
        try {
          const regex = new RegExp(rule.value as string)
          if (!regex.test(value)) {
            return rule.message
          }
        } catch {
          return rule.message || 'Invalid pattern rule'
        }
      }
      break
    }
    case 'email':
      if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return rule.message
      }
      break
    case 'custom': {
      if (typeof rule.validate === 'function') {
        try {
          return rule.validate(value)
        } catch {
          return rule.message || 'Validation failed'
        }
      }
      return null
    }
  }

  return null
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}