import { useState, useRef, useEffect, useCallback } from 'react'
import type { Table } from '@tanstack/react-table'
import type { GridColumnSchema, I18nConfig } from '../types'
import { usePrimitives } from '../context/primitives-context'
import { resolveMessage } from '../helpers/i18n'

interface GridToolbarProps {
  table: Table<Record<string, unknown>>
  columns: GridColumnSchema[]
  i18n?: I18nConfig
  disabled?: boolean
}

export function GridToolbar({ table, columns, i18n, disabled = false }: GridToolbarProps) {
  const { Button, Input, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } =
    usePrimitives()

  const [globalFilter, setGlobalFilter] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const searchPlaceholder = resolveMessage('searchPlaceholder', i18n, 'Search all columns...')
  const columnsLabel = resolveMessage('columns', i18n, 'Columns')

  const handleSearchChange = useCallback((value: string) => {
    setGlobalFilter(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      table.setGlobalFilter(value || undefined)
    }, 300)
  }, [table])

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
          disabled={disabled}
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