import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

function DemoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Schema Demos</h2>
      <p className="text-muted-foreground mb-6">
        Explore the schema-driven engine with these interactive demos.
        Each demo is rendered from a JSON schema definition.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/demo-form"
          className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-semibold text-lg mb-2">Contact Form</h3>
          <p className="text-sm text-muted-foreground">
            Schema-driven form with text, email, select, textarea, and checkbox fields.
          </p>
        </Link>
        <Link
          to="/demo-grid"
          className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-semibold text-lg mb-2">Users Grid</h3>
          <p className="text-sm text-muted-foreground">
            Schema-driven data grid with sortable columns, row selection, and status rendering.
          </p>
        </Link>
      </div>
    </div>
  )
}