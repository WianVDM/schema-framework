import { SchemaLayout } from '@my-framework/core'
import { createFileRoute } from '@tanstack/react-router'
import { hboxLayoutSchema } from '../data/layout-demos-schema'

export const Route = createFileRoute('/demo-hbox-layout')({
  component: DemoHBoxLayoutRoute,
})

function DemoHBoxLayoutRoute() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">HBox Layout</h2>
        <p className="text-muted-foreground">
          Horizontal flexbox layout with configurable gap, alignment, and justify.
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <SchemaLayout schema={hboxLayoutSchema} />
      </div>
    </div>
  )
}
