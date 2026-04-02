import type { Table } from '@tanstack/react-table'
import { usePrimitives } from '../context/primitives-context'

interface GridPaginationProps {
  table: Table<Record<string, unknown>>
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
}

export function GridPagination({
  table,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
}: GridPaginationProps) {
  const { Button } = usePrimitives()

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalPages = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  const pageButtons = getPageNumbers(pageIndex, totalPages)

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="text-sm text-muted-foreground">
        {totalRows} row{totalRows !== 1 ? 's' : ''} total
      </div>
      <div className="flex items-center gap-2">
        {showPageSizeSelector && (
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          variant="outline"
          size="sm"
        >
          ‹
        </Button>
        {pageButtons.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              onClick={() => table.setPageIndex(page as number)}
              variant={page === pageIndex ? 'default' : 'outline'}
              size="sm"
            >
              {(page as number) + 1}
            </Button>
          )
        )}
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          variant="outline"
          size="sm"
        >
          ›
        </Button>
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i)
  }

  const pages: (number | '...')[] = [0]

  if (current > 2) {
    pages.push('...')
  }

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) {
    pages.push('...')
  }

  pages.push(total - 1)
  return pages
}