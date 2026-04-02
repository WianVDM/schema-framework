import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table'
import type { SchemaGridProps, GridSchema, GridColumnSchema, PaginationConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { GridPagination } from './grid-pagination'
import { GridColumnHeader } from './grid-column-header'
import { GridToolbar } from './grid-toolbar'

export function SchemaGrid({ schema, data, onRowClick }: SchemaGridProps) {
  const {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Badge,
  } = usePrimitives()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    schema.columnVisibility ?? {}
  )

  const paginationConfig = resolvePaginationConfig(schema.pagination)
  const isResizable = schema.resizable ?? false

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      schema.columns.map((col: GridColumnSchema) => ({
        accessorKey: col.key,
        header: col.label,
        enableSorting: col.sortable ?? false,
        enableResizing: (col.resizable ?? false) && isResizable,
        enableColumnFilter: col.filterable ?? false,
        size: col.width ? parseInt(col.width, 10) : undefined,
        cell: (info) => formatCellValue(col, info.getValue(), Badge),
      })),
    [schema.columns, isResizable, Badge]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: paginationConfig ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
    initialState: paginationConfig
      ? { pagination: { pageSize: paginationConfig.pageSize } }
      : undefined,
  })

  const tableClassName = applyGridStyles(schema)

  return (
    <div>
      {schema.title && (
        <h2 className="text-xl font-bold mb-1">{schema.title}</h2>
      )}
      {schema.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {schema.description}
        </p>
      )}
      <GridToolbar table={table} columns={schema.columns} />
      <div className="rounded-md border overflow-auto">
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const col = schema.columns.find(
                    (c) => c.key === header.column.id
                  )
                  return (
                    <GridColumnHeader
                      key={header.id}
                      header={header}
                      column={col}
                      filterValue={
                        (header.column.getFilterValue() as string) ?? ''
                      }
                      onFilterChange={(value) =>
                        header.column.setFilterValue(value)
                      }
                      enableResizing={isResizable}
                    />
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={schema.columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {schema.emptyMessage ?? 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row.original, row.index)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const col = schema.columns.find(
                      (c) => c.key === cell.column.id
                    )
                    return (
                      <TableCell
                        key={cell.id}
                        className={getAlignClass(col?.align)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {paginationConfig && (
        <GridPagination
          table={table}
          pageSizeOptions={paginationConfig.pageSizeOptions}
          showPageSizeSelector={paginationConfig.showPageSizeSelector}
        />
      )}
    </div>
  )
}

function formatCellValue(
  col: GridColumnSchema,
  value: unknown,
  Badge?: React.ComponentType<Record<string, unknown>>
): React.ReactNode {
  if (col.type === 'status' && Badge && col.statusConfig && value != null) {
    const statusKey = String(value).toLowerCase()
    const variant = col.statusConfig.variants[statusKey]
    if (variant) {
      return (
        <Badge className={variant.className}>
          {variant.label}
        </Badge>
      )
    }
    return <Badge>{String(value)}</Badge>
  }

  if (col.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (value === null || value === undefined) {
    return '—'
  }

  return String(value)
}

function resolvePaginationConfig(
  pagination?: PaginationConfig | boolean
): PaginationConfig | null {
  if (pagination === undefined || pagination === false) {
    return null
  }
  if (pagination === true) {
    return { pageSize: 10 }
  }
  return pagination
}

export function applyGridStyles(schema: GridSchema): string {
  const classes: string[] = []
  if (schema.striped) {
    classes.push('[&_tbody_tr:nth-child(even)]:bg-muted/50')
  }
  if (schema.hoverable) {
    classes.push('[&_tbody_tr:hover]:bg-muted/80')
  }
  return classes.join(' ')
}

function getAlignClass(align?: 'left' | 'center' | 'right'): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}