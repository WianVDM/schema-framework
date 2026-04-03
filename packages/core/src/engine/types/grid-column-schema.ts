import type { ColumnFilterConfig } from './column-filter-config'
import type { StatusConfig } from './status-config'

export interface GridColumnSchema {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status'
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  filterable?: boolean
  resizable?: boolean
  visible?: boolean
  filter?: ColumnFilterConfig
  statusConfig?: StatusConfig
}