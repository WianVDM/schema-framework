import { createServerFn } from '@tanstack/react-start'
import type { GridSchema } from '@my-framework/core'
import { userGridSchema } from '../data/user-grid-schema'

export const getUserGridSchema = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GridSchema> => {
    return JSON.parse(JSON.stringify(userGridSchema))
  }
)