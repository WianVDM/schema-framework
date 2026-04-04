import type { GridSchema } from './grid-schema'

export interface SchemaGridProps {
  readonly schema: GridSchema
  readonly data: readonly Record<string, unknown>[]
  readonly onRowClick?: (row: Readonly<Record<string, unknown>>, rowId: string) => void
  readonly onPageChange?: (page: number, pageSize: number) => void
  readonly onFilterChange?: (columnKey: string, value: string) => void
}