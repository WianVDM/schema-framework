import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchemaGrid } from '@my-framework/core'
import type { GridSchema } from '@my-framework/core'
import { getOrderGridSchema } from '../server/get-order-grid-schema'
import { getOrders } from '../server/get-orders'

export const Route = createFileRoute('/demo-orders')({
  component: DemoOrdersRoute,
})

function DemoOrdersRoute() {
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema', 'order-grid'],
    queryFn: () => getOrderGridSchema(),
  })

  const { data: orders, isLoading: dataLoading } = useQuery({
    queryKey: ['data', 'orders'],
    queryFn: () => getOrders(),
  })

  if (schemaLoading || dataLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  if (!schema || !orders) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load order data.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SchemaGrid
        schema={schema as GridSchema}
        data={orders}
      />
    </div>
  )
}