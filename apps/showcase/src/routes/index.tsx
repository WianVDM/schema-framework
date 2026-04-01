import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome to Schema Framework</h2>
      <p className="text-muted-foreground mb-6">
        A modern, data-driven UI framework built on TanStack Start, shadcn/ui,
        and a 3-Layer Architecture.
      </p>
      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">3-Layer Architecture</h3>
          <p className="text-sm text-muted-foreground">
            Layer 1 (Primitives) → Layer 2 (Engine) → Layer 3 (Composition).
            Strict dependency flow ensures maintainability.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Schema-Driven UI</h3>
          <p className="text-sm text-muted-foreground">
            Define your UI with JSON schemas. The engine renders forms,
            tables, and fields automatically.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">shadcn/ui Integration</h3>
          <p className="text-sm text-muted-foreground">
            Uses the PrimitivesContext pattern so core stays decoupled
            from shadcn/ui copy-pasted components.
          </p>
        </div>
      </div>
    </div>
  )
}