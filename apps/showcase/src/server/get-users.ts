import { createServerFn } from '@tanstack/react-start'
import type { SerializableRecord } from '../lib/serializable-record'
import { mockUsers } from '../data/mock-users'

export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockUsers
  }
)