import { deepFreeze } from '@my-framework/core'
import type { UserRow } from './user-row'

export const mockUsers = deepFreeze<readonly UserRow[]>([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'editor', active: true },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', active: false },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'editor', active: true },
  { id: 5, name: 'Eve Williams', email: 'eve@example.com', role: 'admin', active: true },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'viewer', active: false },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'editor', active: true },
  { id: 8, name: 'Henry Davis', email: 'henry@example.com', role: 'viewer', active: true },
  { id: 9, name: 'Irene Chen', email: 'irene@example.com', role: 'admin', active: false },
  { id: 10, name: 'Jack Wilson', email: 'jack@example.com', role: 'editor', active: true },
  { id: 11, name: 'Karen Taylor', email: 'karen@example.com', role: 'viewer', active: false },
  { id: 12, name: 'Leo Martin', email: 'leo@example.com', role: 'admin', active: true },
])