import { createFileRoute } from '@tanstack/react-router'
import { LayoutDemo } from '@/components/layout-demo'
import { cardLayoutSchema } from '../data'

export const Route = createFileRoute('/demo-card-layout')({
  component: DemoCardLayoutRoute,
})

function DemoCardLayoutRoute() {
  return (
    <LayoutDemo
      title="Card Grid Layout"
      description="CSS Grid card layout with responsive column breakpoints (sm/md/lg/xl)."
      schema={cardLayoutSchema}
    />
  )
}
