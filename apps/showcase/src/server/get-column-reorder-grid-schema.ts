import type { GridSchema } from '@my-framework/core'
import { createServerFn } from '@tanstack/react-start'
import { columnReorderGridSchema } from '../data/column-reorder-grid-schema'
import { toSerializable } from '../lib/to-serializable'

export const getColumnReorderGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return toSerializable(columnReorderGridSchema)
  },
)
