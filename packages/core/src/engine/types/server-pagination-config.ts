/** Configuration for server-side pagination.
 *  NOTE: `currentPage` is 0-based (first page = 0). */
export interface ServerPaginationConfig {
  totalRecords: number
  /** 0-based page index */
  currentPage: number
}