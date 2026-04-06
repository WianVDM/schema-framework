import { useMemo, useState, useCallback, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SchemaGridProps, GridColumnSchema, VirtualScrollConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { GridToolbar } from './grid-toolbar'
import { GridPagination } from './grid-pagination'
import { GridColumnHeader } from './grid-column-header'
import { resolveMessage } from '../helpers/i18n'

const DEFAULT_OVERSCAN = 10
const DEFAULT_ROW_HEIGHT = 40
const VIRTUAL_CONTAINER_HEIGHT = 600

function resolveVirtualScrollConfig(
  config: VirtualScrollConfig | boolean | undefined
): VirtualScrollConfig | null {
  if (config === undefined || config === false) return null
  if (config === true) {
    return { enabled: true, overscan: DEFAULT_OVERSCAN, rowHeight: DEFAULT_ROW_HEIGHT }
  }
  return config
}

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

  const virtualConfig = resolveVirtualScrollConfig(schema.virtualScroll)
  const isVirtualScroll = virtualConfig !== null

  const paginationConfig = typeof schema.pagination === 'object'
    ? schema.pagination
    : { pageSize: 10 }

  const isServerMode = !!schema.serverPagination

  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    for (const col of schema.columns) {
      if (col.visible === false) {
        visibility[col.key] = false
      }
    }
    return visibility
  }, [schema.columns])

  const columns = useMemo<import('@tanstack/react-table').ColumnDef<Record<string, unknown>>[]>(
    () => buildColumns(schema.columns, Badge, isServerMode),
    [schema.columns, Badge, isServerMode]
  )

  const shouldPaginate = !isServerMode && !isVirtualScroll && schema.pagination !== false
  const shouldShowServerPagination = !!schema.serverPagination

  // NOTE: TanStack Table requires mutable Record<string, unknown>[];
  // the data prop is typed as readonly unknown[] for caller immutability.
  const table = useReactTable({
    data: data as Record<string, unknown>[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(shouldPaginate
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }
      : !isServerMode
        ? {
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
          }
        : {}),
    initialState: {
      pagination: { pageSize: paginationConfig?.pageSize ?? 10 },
      columnVisibility,
    },
    manualPagination: isServerMode,
    getRowId: (row) => String(row[schema.dataKey]),
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const allRows = table.getRowModel().rows

  const virtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => virtualConfig?.rowHeight ?? DEFAULT_ROW_HEIGHT,
    overscan: virtualConfig?.overscan ?? DEFAULT_OVERSCAN,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom = virtualItems.length > 0
    ? totalSize - virtualItems[virtualItems.length - 1].end
    : 0

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

  const renderHeaderRows = () =>
    table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id} aria-rowindex={1}>
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
    ))

  const renderRow = (row: import('@tanstack/react-table').Row<Record<string, unknown>>, rowIndex: number) => (
    <TableRow
      key={row.id}
      className={rowClasses}
      onClick={
        onRowClick
          ? () => onRowClick(row.original, row.id)
          : undefined
      }
      style={onRowClick ? { cursor: 'pointer' } : undefined}
      role="row"
      aria-rowindex={rowIndex + 2}
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
  )

  return (
    <div className="space-y-2">
      {schema.title && (
        <h2 className="text-xl font-bold">{schema.title}</h2>
      )}
      {schema.description && (
        <p className="text-sm text-muted-foreground">{schema.description}</p>
      )}
      {schema.filterable && (
        <GridToolbar table={table} columns={schema.columns} i18n={schema.i18n} disabled={isServerMode} />
      )}
      {isVirtualScroll ? (
        <div
          ref={scrollContainerRef}
          className={borderedClasses}
          style={{ overflow: 'auto', height: `${virtualConfig?.containerHeight ?? VIRTUAL_CONTAINER_HEIGHT}px` }}
        >
          <Table role="grid" aria-label={schema.title ?? 'Data grid'} style={{ width: '100%' }}>
            <TableHeader>
              {renderHeaderRows()}
            </TableHeader>
            <TableBody>
              {allRows.length === 0 ? (
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
                <>
                  {paddingTop > 0 && (
                    <tr aria-hidden="true">
                      <td
                        colSpan={schema.columns.length}
                        style={{ height: `${paddingTop}px`, padding: 0, border: 'none' }}
                      />
                    </tr>
                  )}
                  {virtualItems.map((virtualRow) => {
                    const row = allRows[virtualRow.index]
                    return renderRow(row, virtualRow.index)
                  })}
                  {paddingBottom > 0 && (
                    <tr aria-hidden="true">
                      <td
                        colSpan={schema.columns.length}
                        style={{ height: `${paddingBottom}px`, padding: 0, border: 'none' }}
                      />
                    </tr>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className={borderedClasses}>
          <Table role="grid" aria-label={schema.title ?? 'Data grid'}>
            <TableHeader>
              {renderHeaderRows()}
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
                  const globalIndex = pageIndex * pageSize + rowIndex
                  return renderRow(row, globalIndex)
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {(!!schema.serverPagination || (!isVirtualScroll && schema.pagination !== false)) && (
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
  columns: readonly GridColumnSchema[],
  Badge: React.ComponentType<Record<string, unknown>>,
  disableSort: boolean
): import('@tanstack/react-table').ColumnDef<Record<string, unknown>>[] {
  return columns
    .map((col) => ({
      accessorKey: col.key,
      header: col.label,
      enableSorting: disableSort ? false : (col.sortable ?? false),
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
    const statusKey = String(value).toLowerCase()
    const statusDef = col.statusConfig.variants[statusKey]
    if (statusDef === undefined) {
      console.warn(`[SchemaGrid] No status variant found for key "${statusKey}". Available keys: ${Object.keys(col.statusConfig.variants).join(', ')}`)
    }
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