import { deepFreeze } from '@my-framework/core'
import type { OrderRow } from './order-row'

export const mockOrders = deepFreeze<readonly OrderRow[]>([
  { orderId: 1001, customer: 'Alice Johnson', date: '2026-03-15', total: 249.99, status: 'delivered' },
  { orderId: 1002, customer: 'Bob Smith', date: '2026-03-18', total: 89.50, status: 'shipped' },
  { orderId: 1003, customer: 'Charlie Brown', date: '2026-03-20', total: 1249.00, status: 'processing' },
  { orderId: 1004, customer: 'Diana Prince', date: '2026-03-22', total: 45.00, status: 'pending' },
  { orderId: 1005, customer: 'Eve Williams', date: '2026-03-22', total: 599.99, status: 'cancelled' },
  { orderId: 1006, customer: 'Frank Miller', date: '2026-03-25', total: 175.00, status: 'shipped' },
  { orderId: 1007, customer: 'Grace Lee', date: '2026-03-28', total: 320.50, status: 'delivered' },
  { orderId: 1008, customer: 'Henry Davis', date: '2026-04-01', total: 67.00, status: 'pending' },
])