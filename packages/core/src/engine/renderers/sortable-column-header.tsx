import { useSortable } from '@dnd-kit/sortable'
import type { Header } from '@tanstack/react-table'
import type { GridColumnSchema } from '../types'
import { GridColumnHeader } from './grid-column-header'

interface SortableColumnHeaderProps {
  header: Header<Record<string, unknown>, unknown>
  column: GridColumnSchema | undefined
  filterValue: string
  onFilterChange: (value: string) => void
  enableResizing: boolean
  filterDisabled?: boolean
}

/**
 * Wraps GridColumnHeader with @dnd-kit/sortable's `useSortable` hook
 * to enable drag-and-drop column reordering. Forwards ref, style, and
 * ARIA attributes directly to the underlying <th> via GridColumnHeader
 * to preserve correct table semantics (<th> as direct child of <tr>).
 */
export function SortableColumnHeader({
  header,
  column,
  filterValue,
  onFilterChange,
  enableResizing,
  filterDisabled = false,
}: SortableColumnHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.id,
  })

  const thStyle: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <GridColumnHeader
      header={header}
      column={column}
      filterValue={filterValue}
      onFilterChange={onFilterChange}
      enableResizing={enableResizing}
      filterDisabled={filterDisabled}
      dragHandleProps={listeners}
      thRef={setNodeRef}
      thStyle={thStyle}
      thAttributes={attributes}
    />
  )
}
