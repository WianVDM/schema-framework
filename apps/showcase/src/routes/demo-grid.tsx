import { createFileRoute } from '@tanstack/react-router'
import { SchemaGrid } from '@my-framework/core'
import { userGridSchema, mockUsers } from '../data/mock-schemas'
import { createSelectionStore } from '../stores/selection-store'

export const Route = createFileRoute('/demo-grid')({
  component: DemoGridRoute,
})

const useUserSelection = createSelectionStore<Record<string, unknown>>()

function DemoGridRoute() {
  const { selectedData, setSelected, clearSelection } = useUserSelection()

  const handleRowClick = (row: Record<string, unknown>, rowIndex: number) => {
    setSelected(String(row.id), row)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <SchemaGrid
        schema={userGridSchema}
        data={mockUsers}
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