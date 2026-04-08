import { createFileRoute } from '@tanstack/react-router'
import { SchemaWizard, PrimitivesProvider } from '@my-framework/core'
import { primitives } from '../data/primitive-mappings'
import { getWizardFormSchema } from '../server/get-wizard-form-schema'

function DemoFormWizardPage() {
  const { data: schema } = Route.useLoaderData()

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Wizard form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }

  const handleCancel = () => {
    console.log('Wizard cancelled')
  }

  if (!schema) {
    return <div className="p-8 text-center text-muted-foreground">Loading schema...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Form Wizard</h1>
      <p className="text-muted-foreground mb-8">
        Demonstrates the <code className="text-sm bg-muted px-1 py-0.5 rounded">SchemaWizard</code> renderer
        with multi-step navigation, per-step validation, and an optional review step before submission.
      </p>

      <PrimitivesProvider primitives={primitives}>
        <SchemaWizard
          schema={schema}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </PrimitivesProvider>
    </div>
  )
}

export const Route = createFileRoute('/demo-form-wizard')({
  component: DemoFormWizardPage,
  loader: async () => {
    const data = await getWizardFormSchema()
    return { data }
  },
})