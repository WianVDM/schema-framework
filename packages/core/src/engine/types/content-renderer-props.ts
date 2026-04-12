import type { ContentSchema } from './content-schema'
import type { CustomComponentRegistry } from './custom-component-registry'

/** Props for the ContentRenderer */
export interface ContentRendererProps {
  readonly content: ContentSchema
  readonly customComponents?: CustomComponentRegistry
}
