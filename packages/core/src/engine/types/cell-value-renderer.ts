import type { ReactNode } from 'react'
import type { GridColumnSchema } from './grid-column-schema'

export type CellValueRenderer = (col: Readonly<GridColumnSchema>, value: unknown) => ReactNode