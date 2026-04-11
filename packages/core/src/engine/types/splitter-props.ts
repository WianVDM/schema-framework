import type { ReactNode } from 'react'

/** Props for the Splitter primitive (divided container for resizable regions) */
export interface SplitterProps {
  readonly direction: 'horizontal' | 'vertical'
  readonly onResize?: (sizes: readonly number[]) => void
  readonly initialSizes?: readonly number[]
  readonly minSize?: number
  readonly maxSize?: number
  readonly className?: string
  readonly children: ReactNode
}