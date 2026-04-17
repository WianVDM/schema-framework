import type { SelectOption } from './select-option'

export interface MultiSelectConfig {
  readonly options: readonly SelectOption[]
  readonly maxSelections?: number
  readonly creatable?: boolean
  readonly placeholder?: string
}
