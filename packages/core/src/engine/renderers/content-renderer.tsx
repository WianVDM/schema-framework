import { lazy, type ReactNode, Suspense } from 'react'
import { useCustomComponents } from '../context/custom-component-context'
import type { ContentRendererProps } from '../types/content-renderer-props'
import type { FormSubmitHandler } from '../types/form-submit-handler'
import { SchemaForm } from './schema-form'
import { SchemaGrid } from './schema-grid'
import { SchemaTabs } from './schema-tabs'
import { SchemaWizard } from './schema-wizard'

/** NOTE: Lazy-loaded to avoid circular dependency: content-renderer ↔ schema-layout */
const SchemaLayoutLazy = lazy(() =>
  import('./schema-layout').then(m => ({ default: m.SchemaLayout })),
)

/** Central dispatcher for all ContentSchema variants */
export function ContentRenderer({ content }: ContentRendererProps): ReactNode {
  const customComponents = useCustomComponents()

  switch (content.type) {
    case 'form':
      return <SchemaForm schema={content.schema} onSubmit={noopSubmit} />

    case 'grid':
      return <SchemaGrid schema={content.schema} data={[]} />

    case 'wizard':
      return <SchemaWizard schema={content.schema} onSubmit={noopSubmit} />

    case 'tabs':
      return <SchemaTabs schema={content.schema} />

    case 'layout':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SchemaLayoutLazy schema={content.schema} />
        </Suspense>
      )

    case 'custom':
      return (
        <CustomComponentRenderer
          componentKey={content.componentKey}
          props={content.props}
          customComponents={customComponents}
        />
      )

    default:
      // NOTE: Exhaustiveness check — should never reach with valid ContentSchema
      return null
  }
}

/** No-op submit handler for forms/wizards rendered without explicit callbacks */
const noopSubmit: FormSubmitHandler = async () => {
  // NOTE: Default no-op — layout regions may not always provide submit handlers
}

/** Loading fallback for lazy-loaded layout renderer */
function LoadingFallback(): ReactNode {
  return <div className="p-4 text-muted-foreground text-sm animate-pulse">Loading layout...</div>
}

/** Renders a custom component looked up from the registry */
function CustomComponentRenderer({
  componentKey,
  props,
  customComponents,
}: {
  readonly componentKey: string
  readonly props?: Readonly<Record<string, unknown>>
  readonly customComponents: import('../types/custom-component-registry').CustomComponentRegistry
}): ReactNode {
  const Component = customComponents[componentKey]

  if (!Component) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md text-destructive text-sm">
        Custom component "{componentKey}" not found in registry
      </div>
    )
  }

  return <Component {...(props ?? {})} />
}
