import type { GridColumnSchema } from './grid-column-schema'
import type { PaginationConfig } from './pagination-config'
import type { ServerPaginationConfig } from './server-pagination-config'
import type { I18nConfig } from './i18n-config'

export interface GridSchema {
  readonly title?: string
  readonly description?: string
  readonly columns: readonly GridColumnSchema[]
  readonly dataKey: string
  readonly striped?: boolean
  readonly bordered?: boolean
  readonly hoverable?: boolean
  readonly emptyMessage?: string
  readonly pagination?: PaginationConfig | boolean
  readonly serverPagination?: ServerPaginationConfig
  readonly filterable?: boolean
  readonly resizable?: boolean
  readonly columnVisibility?: Readonly<Record<string, boolean>>
  readonly i18n?: I18nConfig
}