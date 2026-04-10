import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import type { SchemaGridProps, GridColumnSchema, VirtualScrollConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { GridToolbar } from './grid-toolbar'
import { GridPagination } from './grid-pagination'
import { GridColumnHeader } from './grid-column-header'
import { SortableColumnHeader } from './sortable-column-header'
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

export function SchemaGrid({ schema, data, onRowClick, onPageChange, onFilterChange, onColumnOrderChange }: SchemaGridProps) {
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
  const [columnOrder, setColumnOrder] = useState<string[]>(() => schema.columns.map((c) => c.key))

  // NOTE: Reconcile columnOrder when schema.columns changes (e.g. dynamic schemas).
  // Adds any new keys and removes keys no longer in the schema.
  useEffect(() => {
    const schemaKeys = schema.columns.map((c) => c.key)
    setColumnOrder((prev) => {
      const existing = prev.filter((key) => schemaKeys.includes(key))
      const added = schemaKeys.filter((key) => !prev.includes(key))
      return added.length > 0 || existing.length !== prev.length
        ? [...existing, ...added]
        : prev
    })
  }, [schema.columns])

  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {}
    for (const col of schema.columns) {
      if (col.visible === false) {
        visibility[col.key] = false
      }
    }
    return visibility
  }, [schema.columns])

  const isColumnVisible = (id: string) => columnVisibility[id] !== false

  const isColumnReorderEnabled = schema.columnReorder === true

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // NOTE: Compute reorder against visible columns only, preserving hidden column positions.
    const visibleIds = columnOrder.filter(id => isColumnVisible(id))
    const oldVisIndex = visibleIds.indexOf(activeId)
    const newVisIndex = visibleIds.indexOf(overId)
    if (oldVisIndex === -1 || newVisIndex === -1) return

    const reorderedVisible = arrayMove(visibleIds, oldVisIndex, newVisIndex)

    // Merge reordered visible IDs back into full columnOrder
    let visIdx = 0
    const mergedOrder = columnOrder.map(id =>
      isColumnVisible(id) ? reorderedVisible[visIdx++] : id
    )

    setColumnOrder(mergedOrder)
    onColumnOrderChange?.(mergedOrder)
  }, [onColumnOrderChange, columnOrder, columnVisibility])

  const virtualConfig = resolveVirtualScrollConfig(schema.virtualScroll)
  const isVirtualScroll = virtualConfig !== null

  const paginationConfig = typeof schema.pagination === 'object'
    ? schema.pagination
    : { pageSize: 10 }

  const isServerMode = !!schema.serverPagination

  const columns = useMemo<import('@tanstack/react-table').ColumnDef<Record<string, unknown>>[]>(
    () => buildColumns(schema.columns, Badge, isServerMode),
    [schema.columns, Badge, isServerMode]
  )

  const shouldPaginate = !isServerMode && !isVirtualScroll && schema.pagination !== false
  const shouldShowServerPagination = !!schema.serverPagination

  const rowIdMapRef = useRef(new WeakMap<Record<string, unknown>, string>())
  const rowIdCounterRef = useRef(0)

  // NOTE: TanStack Table requires mutable Record<string, unknown>[];
  // the data prop is typed as readonly unknown[] for caller immutability.
  const table = useReactTable({
    data: data as Record<string, unknown>[],
    columns,
    state: { sorting, ...(isColumnReorderEnabled ? { columnOrder } : {}) },
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
    getRowId: (row) => {
      const keyValue = row[schema.dataKey]
      if (keyValue != null && (typeof keyValue === 'string' || typeof keyValue === 'number' || typeof keyValue === 'boolean')) {
        return String(keyValue)
      }
      if (row.id != null) return String(row.id)
      let stableId = rowIdMapRef.current.get(row)
      if (stableId === undefined) {
        stableId = `__row_${rowIdCounterRef.current++}`
        rowIdMapRef.current.set(row, stableId)
      }
      return stableId
    },
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const allRows = table.getRowModel().rows

  const pageSize = table.getState().pagination.pageSize
  const pageOffset = isServerMode
    ? schema.serverPagination!.currentPage * pageSize
    : table.getState().pagination.pageIndex * pageSize

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

  const totalRows = isServerMode
    ? schema.serverPagination!.totalRecords
    : table.getFilteredRowModel().rows.length

  const sortableColumnIds = useMemo(
    () => columnOrder.filter(id => isColumnVisible(id)),
    [columnOrder, columnVisibility]
  )

  const renderHeaderRows = () =>
    table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id} aria-rowindex={1}>
        {headerGroup.headers.map((header) => {
          const colDef = schema.columns.find(
            (c) => c.key === header.id
          )
          const headerProps = {
            header,
            column: colDef,
            filterValue: columnFilters[header.id] ?? '',
            onFilterChange: (val: string) =>
              handleFilterChange(header.id, val),
            enableResizing: schema.resizable ?? false,
            filterDisabled: disableFilters,
          }
          if (isColumnReorderEnabled) {
            return (
              <SortableColumnHeader key={header.id} {...headerProps} />
            )
          }
          return (
            <GridColumnHeader key={header.id} {...headerProps} />
          )
        })}
      </TableRow>
    ))

  const wrapWithDndContext = (content: React.ReactNode) => {
    if (!isColumnReorderEnabled) return content
    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableColumnIds}>
          {content}
        </SortableContext>
      </DndContext>
    )
  }

  const renderRow = (row: import('@tanstack/react-table').Row<Record<string, unknown>>, rowIndex: number) => (
    <TableRow
      key={row.id}
      className={onRowClick ? `${rowClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` : rowClasses}
      onClick={
        onRowClick
          ? () => onRowClick(row.original, row.id)
          : undefined
      }
      onKeyDown={
        onRowClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault()
                onRowClick(row.original, row.id)
              }
            }
          : undefined
      }
      tabIndex={onRowClick ? 0 : undefined}
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
        wrapWithDndContext(
          <div
            ref={scrollContainerRef}
            className={borderedClasses}
            style={{ overflow: 'auto', height: `${virtualConfig?.containerHeight ?? VIRTUAL_CONTAINER_HEIGHT}px` }}
          >
            <Table role="grid" aria-label={schema.title ?? 'Data grid'} aria-rowcount={totalRows + 1} style={{ width: '100%' }}>
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
                    return renderRow(row, pageOffset + virtualRow.index)
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
        )
      ) : wrapWithDndContext(
        <div className={borderedClasses}>
          <Table role="grid" aria-label={schema.title ?? 'Data grid'} aria-rowcount={totalRows + 1}>
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
                table.getRowModel().rows.map((row, rowIndex) =>
                  renderRow(row, pageOffset + rowIndex)
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {(schema.pagination !== false && (!!schema.serverPagination || !isVirtualScroll)) && (
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