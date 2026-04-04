import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchemaForm } from '@my-framework/core'
import type { FormSchema } from '@my-framework/core'
import { getRegistrationFormSchema } from '../server/get-registration-form-schema'

export const Route = createFileRoute('/demo-registration')({
  component: DemoRegistrationRoute,
})

function DemoRegistrationRoute() {
  const { data: schema, isLoading } = useQuery({
    queryKey: ['schema', 'registration-form'],
    queryFn: () => getRegistrationFormSchema(),
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    )
  }

  if (!schema) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load form schema.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SchemaForm
        schema={schema as FormSchema}
        onSubmit={async (values) => {
          alert(JSON.stringify(values, null, 2))
        }}
      />
    </div>
  )
}