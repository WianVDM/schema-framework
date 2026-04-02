import type { Table } from '@tanstack/react-table'
import type { GridColumnSchema } from '../types'
import { usePrimitives } from '../context/primitives-context'

interface GridToolbarProps {
  table: Table<Record<string, unknown>>
  columns: GridColumnSchema[]
}

export function GridToolbar({ table, columns }: GridToolbarProps) {
  const { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } =
    usePrimitives()

  return (
    <div className="flex items-center justify-end pb-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            Columns ▾
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {columns.map((col) => (
            <DropdownMenuItem
              key={col.key}
              onSelect={(e: Event) => {
                e.preventDefault()
                table.getColumn(col.key)?.toggleVisibility()
              }}
            >
              <input
                type="checkbox"
                checked={table.getColumn(col.key)?.getIsVisible() ?? true}
                readOnly
                className="mr-2"
              />
              {col.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}