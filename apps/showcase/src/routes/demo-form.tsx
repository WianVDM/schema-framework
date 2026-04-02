import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SchemaForm } from '@my-framework/core'
import type { FormSchema } from '@my-framework/core'
import { getContactFormSchema } from '../server/schemas'

export const Route = createFileRoute('/demo-form')({
  component: DemoFormRoute,
})

function DemoFormRoute() {
  const { data: schema, isLoading, error } = useQuery({
    queryKey: ['schema', 'contact-form'],
    queryFn: () => getContactFormSchema(),
  })

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Loading form schema...</p>
      </div>
    )
  }

  if (error || !schema) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load form schema.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SchemaForm schema={schema as FormSchema} onSubmit={handleSubmit} />
    </div>
  )
}