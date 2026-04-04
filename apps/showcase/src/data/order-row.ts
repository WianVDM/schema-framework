export interface OrderRow {
  readonly orderId: number
  readonly customer: string
  readonly date: string
  readonly total: number
  readonly status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}