import type { ConditionOperator } from './condition-operator'

export interface FieldCondition {
  readonly field: string
  readonly operator: ConditionOperator
  readonly value?: string | number | boolean | readonly (string | number)[]
}