import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchemaGrid } from '@my-framework/core'
import type { GridSchema } from '@my-framework/core'
import { getUserGridSchema } from '../server/get-user-grid-schema'
import { getUsers } from '../server/get-users'
import { createSelectionStore } from '../stores/selection-store'

export const Route = createFileRoute('/demo-grid')({
  component: DemoGridRoute,
})

const useUserSelection = createSelectionStore<Record<string, unknown>>()

function DemoGridRoute() {
  const { selectedData, setSelected, clearSelection } = useUserSelection()

  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema', 'user-grid'],
    queryFn: () => getUserGridSchema(),
  })

  const { data: users, isLoading: dataLoading } = useQuery({
    queryKey: ['data', 'users'],
    queryFn: () => getUsers(),
  })

  const handleRowClick = (row: Record<string, unknown>, rowId: string) => {
    setSelected(rowId, row)
  }

  if (schemaLoading || dataLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading grid...</p>
      </div>
    )
  }

  if (!schema || !users) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load grid data.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SchemaGrid
        schema={schema as GridSchema}
        data={users}
        onRowClick={handleRowClick}
      />
      {selectedData && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Selected Row</h3>
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(selectedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}