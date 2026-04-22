import { createFileRoute } from '@tanstack/react-router'
import { LayoutDemo } from '@/components/layout-demo'
import { accordionLayoutSchema } from '../data'

export const Route = createFileRoute('/demo-accordion-layout')({
  component: DemoAccordionLayoutRoute,
})

function DemoAccordionLayoutRoute() {
  return (
    <LayoutDemo
      title="Accordion Layout"
      description="Collapsible sections with single/multiple mode, animation, and default open items."
      schema={accordionLayoutSchema}
    />
  )
}
