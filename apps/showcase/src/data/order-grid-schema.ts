import type { GridSchema } from '@my-framework/core'
import { deepFreeze, asDataKey } from '@my-framework/core'

export const orderGridSchema = deepFreeze<GridSchema>({
  title: 'Orders',
  description: 'Track and manage customer orders.',
  columns: [
    { key: 'orderId', label: 'Order #', type: 'number', sortable: true, width: '90px' },
    { key: 'customer', label: 'Customer', sortable: true, filterable: true },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'total', label: 'Total', type: 'number', sortable: true, align: 'right' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      statusConfig: {
        variants: {
          pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800' },
          shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
          delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
        },
      },
    },
  ],
  dataKey: asDataKey('orderId'),
  striped: true,
  hoverable: true,
  bordered: false,
  pagination: true,
  emptyMessage: 'No orders found.',
})