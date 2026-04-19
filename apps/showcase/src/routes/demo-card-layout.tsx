import { SchemaLayout } from '@my-framework/core'
import { createFileRoute } from '@tanstack/react-router'
import { cardLayoutSchema } from '../data/layout-demos-schema'

export const Route = createFileRoute('/demo-card-layout')({
  component: DemoCardLayoutRoute,
})

function DemoCardLayoutRoute() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Card Grid Layout</h2>
        <p className="text-muted-foreground">
          CSS Grid card layout with responsive column breakpoints (sm/md/lg/xl).
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <SchemaLayout schema={cardLayoutSchema} />
      </div>
    </div>
  )
}
