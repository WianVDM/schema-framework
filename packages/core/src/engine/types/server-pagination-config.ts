/** Configuration for server-side pagination.
 *  NOTE: `currentPage` is 0-based (first page = 0). */
export interface ServerPaginationConfig {
  readonly totalRecords: number
  /** 0-based page index */
  readonly currentPage: number
}