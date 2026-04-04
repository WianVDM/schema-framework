import type { ColumnFilterConfig } from './column-filter-config'
import type { StatusConfig } from './status-config'

export interface GridColumnSchema {
  readonly key: string
  readonly label: string
  readonly type?: 'text' | 'number' | 'date' | 'boolean' | 'status'
  readonly sortable?: boolean
  readonly width?: string
  readonly align?: 'left' | 'center' | 'right'
  readonly filterable?: boolean
  readonly resizable?: boolean
  readonly visible?: boolean
  readonly filter?: ColumnFilterConfig
  readonly statusConfig?: StatusConfig
}