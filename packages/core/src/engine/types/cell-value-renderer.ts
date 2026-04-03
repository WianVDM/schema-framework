import type { ReactNode } from 'react'
import type { GridColumnSchema } from './grid-column-schema'

export type CellValueRenderer = (col: GridColumnSchema, value: unknown) => ReactNode