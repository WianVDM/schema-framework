// Layer 1: DataTable primitive
// Generic table wrapper with built-in pagination, empty state, and loading skeleton.
// Accepts standard TanStack Table options. Knows nothing about schemas.

import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

interface DataTableProps {
  data: Record<string, unknown>[]
  columns: ColumnDef<Record<string, unknown>>[]
  pageSize?: number
  emptyMessage?: string
  isLoading?: boolean
}

export function DataTable({
  data,
  columns,
  pageSize = 10,
  emptyMessage = 'No data available',
  isLoading = false,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((_, i) => (
                <th key={i} className="h-10 px-4 text-left">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="h-10 px-4">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-muted/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-10 px-4 text-left text-sm font-medium text-muted-foreground"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}