import { createFileRoute } from '@tanstack/react-router'
import type { FieldSchema } from '@my-framework/core'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

const sampleSchema: FieldSchema[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'role', label: 'Role', type: 'select', options: ['Admin', 'User', 'Viewer'] },
]

function DemoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Schema Demo</h2>
      <p className="text-muted-foreground mb-6">
        This page demonstrates a JSON schema consumed by the core engine.
        In future phases, the engine renderers will transform this schema
        into a fully functional form.
      </p>
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Sample Schema</h3>
        <pre className="bg-muted p-4 rounded text-sm overflow-auto">
          {JSON.stringify(sampleSchema, null, 2)}
        </pre>
      </div>
      <div className="border rounded-lg p-6 mt-4">
        <h3 className="font-semibold mb-4">Preview (Static)</h3>
        <div className="space-y-4">
          {sampleSchema.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                  defaultValue=""
                >
                  <option value="" disabled>Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}