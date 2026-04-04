export interface UserRow {
  readonly id: number
  readonly name: string
  readonly email: string
  readonly role: 'admin' | 'editor' | 'viewer'
  readonly active: boolean
}