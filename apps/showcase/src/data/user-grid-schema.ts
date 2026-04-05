import type { GridSchema } from '@my-framework/core'
import { deepFreeze, asDataKey } from '@my-framework/core'

export const userGridSchema = deepFreeze<GridSchema>({
  title: 'Users',
  description: 'Manage user accounts and roles.',
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', sortable: true, filterable: true, resizable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true, resizable: true },
    {
      key: 'role',
      label: 'Role',
      type: 'status',
      sortable: true,
      filterable: true,
      statusConfig: {
        variants: {
          admin: { label: 'Admin', className: 'bg-blue-100 text-blue-800' },
          editor: { label: 'Editor', className: 'bg-green-100 text-green-800' },
          viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
        },
      },
    },
    { key: 'active', label: 'Active', type: 'boolean', width: '80px', align: 'center' },
  ],
  dataKey: asDataKey('id'),
  striped: true,
  hoverable: true,
  emptyMessage: 'No users found.',
  pagination: { pageSize: 5, pageSizeOptions: [5, 10, 25], showPageSizeSelector: true },
  resizable: true,
  columnVisibility: {},
})