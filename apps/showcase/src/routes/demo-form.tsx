import { createFileRoute } from '@tanstack/react-router'
import { SchemaForm } from '@my-framework/core'
import { contactFormSchema } from '../data/mock-schemas'

export const Route = createFileRoute('/demo-form')({
  component: DemoFormRoute,
})

function DemoFormRoute() {
  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SchemaForm schema={contactFormSchema} onSubmit={handleSubmit} />
    </div>
  )
}