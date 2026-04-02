import { useMemo, useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { SchemaGridProps, GridColumnSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { GridToolbar } from './grid-toolbar'
import { GridPagination } from './grid-pagination'
import { GridColumnHeader } from './grid-column-header'
import { resolveMessage } from '../helpers/i18n'

export function SchemaGrid({ schema, data, onRowClick, onPageChange, onFilterChange }: SchemaGridProps) {
  const {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
  } = usePrimitives()

  const [sorting, setSorting] = useState<import('@tanstack/react-table').SortingState>([])
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const paginationConfig = typeof schema.pagination === 'object'
    ? schema.pagination
    : { pageSize: 10 }

  const isServerMode = !!schema.serverPagination

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => buildColumns(schema.columns, Badge),
    [schema.columns, Badge]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerMode
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
    initialState: {
      pagination: { pageSize: paginationConfig?.pageSize ?? 10 },
    },
    manualPagination: isServerMode,
  })

  const disableFilters = isServerMode && !onFilterChange

  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    if (isServerMode) {
      onFilterChange?.(columnKey, value)
      setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
    } else {
      setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
      table.getColumn(columnKey)?.setFilterValue(value)
    }
  }, [table, isServerMode, onFilterChange])

  const borderedClasses = schema.bordered
    ? 'border border-border rounded-lg overflow-hidden'
    : 'rounded-lg overflow-hidden'

  const rowClasses = [
    schema.hoverable !== false ? 'hover:bg-muted/50' : '',
    schema.striped ? 'even:bg-muted/30' : '',
    'border-b last:border-b-0 transition-colors',
  ]
    .filter(Boolean)
    .join(' ')

  const cellBorderClasses = schema.bordered ? 'border-r last:border-r-0 px-4 py-2' : 'px-4 py-2'
  const headerBorderClasses = schema.bordered ? 'border-r last:border-r-0' : ''

  const emptyMessage = resolveMessage('noData', schema.i18n, schema.emptyMessage ?? 'No data available')

  return (
    <div className="space-y-2">
      {schema.title && (
        <h2 className="text-xl font-bold">{schema.title}</h2>
      )}
      {schema.description && (
        <p className="text-sm text-muted-foreground">{schema.description}</p>
      )}
      {schema.filterable && (
        <GridToolbar table={table} columns={schema.columns} i18n={schema.i18n} />
      )}
      <div className={borderedClasses}>
        <Table role="grid" aria-label={schema.title ?? 'Data grid'}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const colDef = schema.columns.find(
                    (c) => c.key === header.id
                  )
                  return (
                    <GridColumnHeader
                      key={header.id}
                      header={header}
                      column={colDef}
                      filterValue={columnFilters[header.id] ?? ''}
                      onFilterChange={(val) =>
                        handleFilterChange(header.id, val)
                      }
                      enableResizing={schema.resizable ?? false}
                      filterDisabled={disableFilters}
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
                  role="cell"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => {
                const { pageIndex, pageSize } = table.getState().pagination
                const globalIndex = pageIndex * pageSize + rowIndex + 2
                return (
                <TableRow
                  key={row.id}
                  className={rowClasses}
                  onClick={
                    onRowClick
                      ? () => onRowClick(row.original, rowIndex)
                      : undefined
                  }
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                  role="row"
                  aria-rowindex={globalIndex}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`text-sm ${cellBorderClasses}`}
                      role="cell"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>
      {schema.pagination !== false && (
        <GridPagination
          table={table}
          pageSizeOptions={paginationConfig?.pageSizeOptions}
          showPageSizeSelector={paginationConfig?.showPageSizeSelector}
          i18n={schema.i18n}
          serverPagination={schema.serverPagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

function buildColumns(
  columns: GridColumnSchema[],
  Badge: React.ComponentType<Record<string, unknown>>
): ColumnDef<Record<string, unknown>>[] {
  return columns
    .filter((col) => col.visible !== false)
    .map((col) => ({
      accessorKey: col.key,
      header: col.label,
      enableSorting: col.sortable ?? false,
      enableResizing: col.resizable ?? false,
      cell: (info: import('@tanstack/react-table').CellContext<Record<string, unknown>, unknown>) =>
        renderCellValue(col, info.getValue(), Badge),
      size: col.width ? parseInt(col.width, 10) : undefined,
    }))
}

function renderCellValue(
  col: GridColumnSchema,
  value: unknown,
  Badge: React.ComponentType<Record<string, unknown>>
): React.ReactNode {
  if (col.type === 'status' && col.statusConfig && value != null) {
    const statusKey = String(value)
    const statusDef = col.statusConfig.variants[statusKey]
    if (statusDef) {
      return (
        <Badge variant="outline" className={statusDef.className}>
          {statusDef.label}
        </Badge>
      )
    }
  }
  return value != null ? String(value) : ''
}