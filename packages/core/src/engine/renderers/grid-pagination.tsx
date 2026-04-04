import type { Table } from '@tanstack/react-table'
import type { I18nConfig, ServerPaginationConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { resolveMessage } from '../helpers/i18n'

interface GridPaginationProps {
  readonly table: Table<Record<string, unknown>>
  readonly pageSizeOptions?: readonly number[]
  readonly showPageSizeSelector?: boolean
  readonly i18n?: I18nConfig
  readonly serverPagination?: ServerPaginationConfig
  readonly onPageChange?: (page: number, pageSize: number) => void
}

export function GridPagination({
  table,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  i18n,
  serverPagination,
  onPageChange,
}: GridPaginationProps) {
  const { Button } = usePrimitives()

  const isServerMode = !!serverPagination

  if (isServerMode && !onPageChange) {
    console.warn('[SchemaGrid] serverPagination is enabled but onPageChange is not provided. The grid will not be able to fetch new pages.')
  }

  const pageIndex = isServerMode
    ? serverPagination.currentPage
    : table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalPages = isServerMode
    ? Math.ceil(serverPagination.totalRecords / pageSize)
    : table.getPageCount()
  const totalRows = isServerMode
    ? serverPagination.totalRecords
    : table.getFilteredRowModel().rows.length

  const rowsLabel = resolveMessage('rows', i18n, 'rows')
  const pageLabel = resolveMessage('page', i18n, '/ page')
  const pageSizeLabel = resolveMessage('pageSize', i18n, 'Page size')
  const previousLabel = resolveMessage('previous', i18n, 'Previous')
  const nextLabel = resolveMessage('next', i18n, 'Next')

  const pageButtons = getPageNumbers(pageIndex, totalPages)

  const handlePrevious = () => {
    if (isServerMode) {
      onPageChange?.(pageIndex - 1, pageSize)
    } else {
      table.previousPage()
    }
  }

  const handleNext = () => {
    if (isServerMode) {
      onPageChange?.(pageIndex + 1, pageSize)
    } else {
      table.nextPage()
    }
  }

  const handlePageSelect = (page: number) => {
    if (isServerMode) {
      onPageChange?.(page, pageSize)
    } else {
      table.setPageIndex(page)
    }
  }

  const canPreviousPage = isServerMode ? pageIndex > 0 : table.getCanPreviousPage()
  const canNextPage = isServerMode ? pageIndex < totalPages - 1 : table.getCanNextPage()

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="text-sm text-muted-foreground">
        {totalRows} {rowsLabel}
      </div>
      <div className="flex items-center gap-2">
        {showPageSizeSelector && (
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value)
              table.setPageSize(newSize)
              table.setPageIndex(0)
              if (isServerMode) {
                onPageChange?.(0, newSize)
              }
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            aria-label={pageSizeLabel}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} {pageLabel}
              </option>
            ))}
          </select>
        )}
        <Button
          onClick={handlePrevious}
          disabled={!canPreviousPage}
          variant="outline"
          size="sm"
          aria-label={previousLabel}
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
              onClick={() => handlePageSelect(page as number)}
              variant={page === pageIndex ? 'default' : 'outline'}
              size="sm"
              aria-label={`Page ${(page as number) + 1}`}
              aria-current={page === pageIndex ? 'page' : undefined}
            >
              {(page as number) + 1}
            </Button>
          )
        )}
        <Button
          onClick={handleNext}
          disabled={!canNextPage}
          variant="outline"
          size="sm"
          aria-label={nextLabel}
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