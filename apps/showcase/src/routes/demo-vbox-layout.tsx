import { createFileRoute } from '@tanstack/react-router'
import { LayoutDemo } from '@/components/layout-demo'
import { vboxLayoutSchema } from '../data'

export const Route = createFileRoute('/demo-vbox-layout')({
  component: DemoVBoxLayoutRoute,
})

function DemoVBoxLayoutRoute() {
  return (
    <LayoutDemo
      title="VBox Layout"
      description="Vertical flexbox layout with configurable gap, alignment, and justify."
      schema={vboxLayoutSchema}
    />
  )
}
