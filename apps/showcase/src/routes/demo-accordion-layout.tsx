import { SchemaLayout } from '@my-framework/core'
import { createFileRoute } from '@tanstack/react-router'
import { accordionLayoutSchema } from '../data/layout-demos-schema'

export const Route = createFileRoute('/demo-accordion-layout')({
  component: DemoAccordionLayoutRoute,
})

function DemoAccordionLayoutRoute() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Accordion Layout</h2>
        <p className="text-muted-foreground">
          Collapsible sections with single/multiple mode, animation, and default open items.
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <SchemaLayout schema={accordionLayoutSchema} />
      </div>
    </div>
  )
}
