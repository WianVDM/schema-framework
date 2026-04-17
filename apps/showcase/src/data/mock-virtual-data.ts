import type { VirtualGridRow } from './virtual-grid-row'

const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Irene',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Noah',
  'Olivia',
  'Peter',
  'Quinn',
  'Rachel',
  'Sam',
  'Tara',
]
const LAST_NAMES = [
  'Johnson',
  'Smith',
  'Brown',
  'Prince',
  'Williams',
  'Miller',
  'Lee',
  'Davis',
  'Chen',
  'Wilson',
  'Taylor',
  'Martin',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Clark',
  'Lewis',
  'Young',
]
const ROLES = ['admin', 'editor', 'viewer'] as const

function seededName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]
  return `${first} ${last}`
}

function generateVirtualGridRows(count: number): readonly VirtualGridRow[] {
  const rows: VirtualGridRow[] = new Array(count)
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i + 1,
      name: seededName(i),
      email: `${seededName(i).toLowerCase().replace(' ', '.')}@example.com`,
      role: ROLES[i % 3],
      active: i % 7 !== 0,
    }
  }
  return Object.freeze(rows)
}

export const mockVirtualData: readonly VirtualGridRow[] = generateVirtualGridRows(10_000)
