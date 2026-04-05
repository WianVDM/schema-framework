export interface VirtualGridRow {
  readonly [key: string]: string | number | boolean
  readonly id: number
  readonly name: string
  readonly email: string
  readonly role: 'admin' | 'editor' | 'viewer'
  readonly active: boolean
}
