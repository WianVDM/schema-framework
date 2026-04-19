/** Responsive column configuration for card grid layouts */
export interface CardGridResponsiveColumns {
  readonly sm?: number
  readonly md?: number
  readonly lg?: number
  readonly xl?: number
}

/** Configuration for card grid layout */
export interface CardGridConfig {
  /** Number of columns — fixed number or responsive breakpoints */
  readonly columns?: number | CardGridResponsiveColumns
  /** Gap between cards in px or CSS value (e.g., '1rem') */
  readonly gap?: number | string
  /** Padding inside each card region in px or CSS value */
  readonly padding?: number | string
}
