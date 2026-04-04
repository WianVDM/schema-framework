import type { ValidationRule } from './validation-rule'

export interface RuntimeValidationRule extends ValidationRule {
  readonly validate?: (value: unknown) => string | null
}