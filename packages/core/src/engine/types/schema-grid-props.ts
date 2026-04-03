import type { GridSchema } from './grid-schema'

export interface SchemaGridProps {
  schema: GridSchema
  data: Record<string, unknown>[]
  onRowClick?: (row: Record<string, unknown>, rowId: string) => void
  onPageChange?: (page: number, pageSize: number) => void
  onFilterChange?: (columnKey: string, value: string) => void
}