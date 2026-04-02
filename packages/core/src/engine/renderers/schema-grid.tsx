import { useState, useMemo, useCallback } from 'react'
import type { SchemaGridProps, GridColumnSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'

type SortDirection = 'asc' | 'desc' | null

export function SchemaGrid({ schema, data, onRowClick }: SchemaGridProps) {
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } =
    usePrimitives()

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = useCallback((columnKey: string) => {
    setSortColumn((prev) => {
      if (prev === columnKey) {
        setSortDirection((dir) =>
          dir === 'asc' ? 'desc' : dir === 'desc' ? null : 'asc'
        )
        return columnKey
      }
      setSortDirection('asc')
      return columnKey
    })
  }, [])

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === bVal) return 0
      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

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
            <TableRow>
              {schema.columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  className={getAlignClass(col.align)}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:underline cursor-pointer"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <SortIndicator
                        active={sortColumn === col.key}
                        direction={sortDirection}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={schema.columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {schema.emptyMessage ?? 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={
                    onRowClick
                      ? 'cursor-pointer'
                      : ''
                  }
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {schema.columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={getAlignClass(col.align)}
                    >
                      {renderCellValue(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function renderCellValue(
  col: GridColumnSchema,
  row: Record<string, unknown>
): React.ReactNode {
  const value = row[col.key]

  if (col.render) {
    return col.render(value, row)
  }

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
  active,
  direction,
}: {
  active: boolean
  direction: SortDirection
}) {
  if (!active || !direction) {
    return <span className="text-muted-foreground text-xs">↕</span>
  }
  return (
    <span className="text-xs">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}