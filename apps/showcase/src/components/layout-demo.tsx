import type { LayoutSchema } from '@my-framework/core'
import { SchemaLayout } from '@my-framework/core'
import type { ReactNode } from 'react'

interface LayoutDemoProps {
  readonly title: string
  readonly description: string
  readonly schema: LayoutSchema
}

/** NOTE: Shared layout demo wrapper — renders heading, description, and SchemaLayout in a bordered container */
export function LayoutDemo({ title, description, schema }: LayoutDemoProps): ReactNode {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="border rounded-lg p-4">
        <SchemaLayout schema={schema} />
      </div>
    </div>
  )
}
