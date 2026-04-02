import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { SchemaGridProps, GridColumnSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'

export function SchemaGrid({ schema, data, onRowClick }: SchemaGridProps) {
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } =
    usePrimitives()

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      schema.columns.map((col: GridColumnSchema) => ({
        accessorKey: col.key,
        header: col.label,
        enableSorting: col.sortable ?? false,
        size: col.width ? parseInt(col.width, 10) : undefined,
        cell: (info) => formatCellValue(col, info.getValue()),
      })),
    [schema.columns]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const col = schema.columns.find(
                    (c) => c.key === header.column.id
                  )
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: col?.width }}
                      className={getAlignClass(col?.align)}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:underline cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <SortIndicator
                            sorted={header.column.getIsSorted()}
                          />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
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
    </div>
  )
}

function formatCellValue(col: GridColumnSchema, value: unknown): string {
  if (col.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (value === null || value === undefined) {
    return '—'
  }

  return String(value)
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

function SortIndicator({
  sorted,
}: {
  sorted: false | 'asc' | 'desc'
}) {
  if (!sorted) {
    return <span className="text-muted-foreground text-xs">↕</span>
  }
  return (
    <span className="text-xs">
      {sorted === 'asc' ? '↑' : '↓'}
    </span>
  )
}