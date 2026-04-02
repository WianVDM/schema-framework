import type { Header } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import type { GridColumnSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'

interface GridColumnHeaderProps {
  header: Header<Record<string, unknown>, unknown>
  column: GridColumnSchema | undefined
  filterValue: string
  onFilterChange: (value: string) => void
  enableResizing: boolean
}

export function GridColumnHeader({
  header,
  column,
  filterValue,
  onFilterChange,
  enableResizing,
}: GridColumnHeaderProps) {
  const { TableHead, Input } = usePrimitives()

  const isFilterable = column?.filterable ?? false
  const isResizable = (column?.resizable ?? false) && enableResizing
  const filterPlaceholder = column?.filter?.placeholder ?? 'Filter...'

  return (
    <TableHead
      key={header.id}
      style={{
        width: column?.width,
        minWidth: isResizable ? 50 : undefined,
        position: 'relative',
      }}
      className={getAlignClass(column?.align)}
      aria-sort={
        header.column.getIsSorted() === 'asc'
          ? 'ascending'
          : header.column.getIsSorted() === 'desc'
            ? 'descending'
            : undefined
      }
      role="columnheader"
    >
      <div className="flex items-center gap-1">
        {header.column.getCanSort() ? (
          <button
            type="button"
            className="flex items-center gap-1 hover:underline cursor-pointer font-medium"
            onClick={header.column.getToggleSortingHandler()}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            <SortIndicator sorted={header.column.getIsSorted()} />
          </button>
        ) : (
          <span className="font-medium">
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>
        )}
      </div>
      {isFilterable && (
        <div className="mt-1">
          <Input
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFilterChange(e.target.value)
            }
            className="h-6 text-xs"
          />
        </div>
      )}
      {isResizable && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/20 ${
            header.column.getIsResizing() ? 'bg-primary/40' : ''
          }`}
        />
      )}
    </TableHead>
  )
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