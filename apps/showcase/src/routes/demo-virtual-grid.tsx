import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchemaGrid } from '@my-framework/core'
import type { GridSchema } from '@my-framework/core'
import { getVirtualGridSchema } from '../server/get-virtual-grid-schema'
import { getVirtualData } from '../server/get-virtual-data'

export const Route = createFileRoute('/demo-virtual-grid')({
  component: DemoVirtualGridRoute,
})

function DemoVirtualGridRoute() {
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema', 'virtual-grid'],
    queryFn: () => getVirtualGridSchema(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: rows, isLoading: dataLoading } = useQuery({
    queryKey: ['data', 'virtual'],
    queryFn: () => getVirtualData(),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (schemaLoading || dataLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading virtual grid...</p>
      </div>
    )
  }

  if (!schema || !rows) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load virtual grid data.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <SchemaGrid
        schema={schema as GridSchema}
        data={rows}
      />
      <p className="text-xs text-muted-foreground">
        Rendering {rows.length.toLocaleString()} rows with virtual scrolling.
        Only visible rows are mounted in the DOM for optimal performance.
      </p>
    </div>
  )
}