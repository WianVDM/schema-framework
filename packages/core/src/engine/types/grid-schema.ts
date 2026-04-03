import type { GridColumnSchema } from './grid-column-schema'
import type { PaginationConfig } from './pagination-config'
import type { ServerPaginationConfig } from './server-pagination-config'
import type { I18nConfig } from './i18n-config'

export interface GridSchema {
  title?: string
  description?: string
  columns: GridColumnSchema[]
  dataKey: string
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  emptyMessage?: string
  pagination?: PaginationConfig | boolean
  serverPagination?: ServerPaginationConfig
  filterable?: boolean
  resizable?: boolean
  columnVisibility?: Record<string, boolean>
  i18n?: I18nConfig
}