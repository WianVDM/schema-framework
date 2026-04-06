import { createFileRoute } from '@tanstack/react-router'
import { SchemaForm } from '@my-framework/core'
import { PrimitivesProvider } from '@my-framework/core'
import { primitives } from '../data/primitive-mappings'
import { getMultiselectFormSchema } from '../server/get-multiselect-form-schema'

function DemoMultiSelectPage() {
  const { data: schema } = Route.useLoaderData()

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Multi-select form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }

  if (!schema) {
    return <div className="p-8 text-center text-muted-foreground">Loading schema...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Multi-Select / TagInput</h1>
      <p className="text-muted-foreground mb-8">
        Demonstrates the <code className="text-sm bg-muted px-1 py-0.5 rounded">multiselect</code> field type
        with predefined options, custom tag creation, selection limits, and default values.
      </p>

      <PrimitivesProvider primitives={primitives}>
        <SchemaForm schema={schema} onSubmit={handleSubmit} />
      </PrimitivesProvider>
    </div>
  )
}

export const Route = createFileRoute('/demo-multi-select')({
  component: DemoMultiSelectPage,
  loader: async () => {
    const data = await getMultiselectFormSchema()
    return { data }
  },
})