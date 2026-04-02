import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import type { GridColumnSchema, I18nConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { resolveMessage } from '../helpers/i18n'

interface GridToolbarProps {
  table: Table<Record<string, unknown>>
  columns: GridColumnSchema[]
  i18n?: I18nConfig
}

export function GridToolbar({ table, columns, i18n }: GridToolbarProps) {
  const { Button, Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } =
    usePrimitives()

  const [globalFilter, setGlobalFilter] = useState('')

  const searchPlaceholder = resolveMessage('searchPlaceholder', i18n, 'Search all columns...')
  const columnsLabel = resolveMessage('columns', i18n, 'Columns')

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value)
    table.setGlobalFilter(value || undefined)
  }

  return (
    <div className="flex items-center justify-between pb-2 gap-2">
      <div className="flex-1 max-w-sm">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSearchChange(e.target.value)
          }
          className="h-8 text-sm"
          aria-label={searchPlaceholder}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" aria-label={columnsLabel}>
            {columnsLabel} ▾
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
                aria-label={`Toggle ${col.label} column`}
              />
              {col.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}