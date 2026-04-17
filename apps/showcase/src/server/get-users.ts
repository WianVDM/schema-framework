import { createServerFn } from '@tanstack/react-start'
import { mockUsers } from '../data/mock-users'
import type { SerializableRecord } from '../lib/serializable-record'

export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockUsers
  },
)
