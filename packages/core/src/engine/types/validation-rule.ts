import type { ValidationType } from './validation-type'

export interface ValidationRule {
  readonly type: ValidationType
  readonly value?: string | number
  readonly message: string
}
