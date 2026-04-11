import { createServerFn } from '@tanstack/react-start'
import type { GridSchema } from '@my-framework/core'
import { toSerializable } from '../lib/to-serializable'
import { columnReorderGridSchema } from '../data/column-reorder-grid-schema'

export const getColumnReorderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(columnReorderGridSchema)
  }
)