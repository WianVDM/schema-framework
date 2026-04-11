import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SchemaWizard, PrimitivesProvider } from '@my-framework/core'
import type { WizardSchema } from '@my-framework/core'
import { primitives } from '../data/primitive-mappings'
import { getWizardFormSchema } from '../server/get-wizard-form-schema'

const INITIAL_VALUES = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
}

function DemoFormWizardPage() {
  const { data: schema } = Route.useLoaderData()
  const [nonLinear, setNonLinear] = useState(false)
  const [currentStepLabel, setCurrentStepLabel] = useState<string>('')

  const handleSubmit = (values: Record<string, unknown>) => {
    console.log('Wizard form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }

  const handleCancel = () => {
    console.log('Wizard cancelled')
  }

  const handleStepChange = (stepIndex: number, direction: 'next' | 'previous' | 'jump') => {
    const stepName = schema?.steps[stepIndex]?.title ?? `Step ${stepIndex + 1}`
    setCurrentStepLabel(`${stepName} (${direction})`)
  }

  if (!schema) {
    return <div className="p-8 text-center text-muted-foreground">Loading schema...</div>
  }

  const enhancedSchema: WizardSchema = nonLinear
    ? { ...schema, mode: 'nonlinear' }
    : schema

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Form Wizard</h1>
      <p className="text-muted-foreground mb-6">
        Demonstrates the <code className="text-sm bg-muted px-1 py-0.5 rounded">SchemaWizard</code> renderer
        with multi-step navigation, per-step validation, and an optional review step before submission.
      </p>

      <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={nonLinear}
            onChange={(e) => setNonLinear(e.target.checked)}
            className="rounded"
          />
          Non-linear mode (jump to visited steps)
        </label>
        {currentStepLabel && (
          <span className="text-sm text-muted-foreground ml-auto" aria-live="polite">
            Last navigation: {currentStepLabel}
          </span>
        )}
      </div>

      <PrimitivesProvider primitives={primitives}>
        <SchemaWizard
          schema={enhancedSchema}
          initialValues={INITIAL_VALUES}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onStepChange={handleStepChange}
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