export interface FieldCondition {
  field: string
  operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'truthy' | 'falsy'
  value?: string | number | boolean | (string | number)[]
}