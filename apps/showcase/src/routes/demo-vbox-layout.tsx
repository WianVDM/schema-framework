import { SchemaLayout } from '@my-framework/core'
import { createFileRoute } from '@tanstack/react-router'
import { vboxLayoutSchema } from '../data/layout-demos-schema'

export const Route = createFileRoute('/demo-vbox-layout')({
  component: DemoVBoxLayoutRoute,
})

function DemoVBoxLayoutRoute() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">VBox Layout</h2>
        <p className="text-muted-foreground">
          Vertical flexbox layout with configurable gap, alignment, and justify.
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <SchemaLayout schema={vboxLayoutSchema} />
      </div>
    </div>
  )
}
