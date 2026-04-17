import type { GridSchema } from '@my-framework/core'
import { deepFreeze, SchemaGrid } from '@my-framework/core'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getColumnReorderGridSchema } from '../server/get-column-reorder-grid-schema'

export const Route = createFileRoute('/demo-column-reordering')({
  component: DemoColumnReorderingRoute,
})

const mockData = deepFreeze([
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    department: 'Engineering',
    role: 'Senior Developer',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    department: 'Marketing',
    role: 'Marketing Lead',
    status: 'active',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    department: 'Engineering',
    role: 'QA Engineer',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Dan Wilson',
    email: 'dan@example.com',
    department: 'Sales',
    role: 'Account Executive',
    status: 'inactive',
  },
  {
    id: '5',
    name: 'Eve Brown',
    email: 'eve@example.com',
    department: 'HR',
    role: 'Recruiter',
    status: 'active',
  },
  {
    id: '6',
    name: 'Frank Miller',
    email: 'frank@example.com',
    department: 'Engineering',
    role: 'Tech Lead',
    status: 'active',
  },
  {
    id: '7',
    name: 'Grace Lee',
    email: 'grace@example.com',
    department: 'Design',
    role: 'UI Designer',
    status: 'pending',
  },
  {
    id: '8',
    name: 'Henry Taylor',
    email: 'henry@example.com',
    department: 'Finance',
    role: 'Analyst',
    status: 'active',
  },
])

function DemoColumnReorderingRoute() {
  const { data: schema, isLoading } = useQuery({
    queryKey: ['schema', 'column-reorder-grid'],
    queryFn: () => getColumnReorderGridSchema(),
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading grid...</p>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load grid schema.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <SchemaGrid
        schema={schema as GridSchema}
        data={mockData}
        onColumnOrderChange={_order => {
          /* demo: no-op */
        }}
      />
      <div className="border rounded-lg p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Drag column headers by the grip handle (⋮⋮) to reorder columns. The{' '}
          <code>columnReorder: true</code> option in the schema enables this feature.
        </p>
      </div>
    </div>
  )
}
