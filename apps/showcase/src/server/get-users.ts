import { createServerFn } from '@tanstack/react-start'
import { mockUsers } from '../data/mock-users'

type SerializableRecord = Record<string, string | number | boolean | null>

export const getUsers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<readonly SerializableRecord[]> => {
    return mockUsers
  }
)