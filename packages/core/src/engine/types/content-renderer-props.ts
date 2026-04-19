import type { ContentSchema } from './content-schema'

/** Props for the ContentRenderer — custom components accessed via CustomComponentContext */
export interface ContentRendererProps {
  readonly content: ContentSchema
}
