import type { ResponsiveConfig } from './responsive-config'
import type { ContentSchema } from './content-schema'
import type { I18nConfig } from './i18n-config'

/** A single region within a layout */
export interface LayoutRegion {
  readonly id: string
  readonly position: string
  readonly title?: string
  readonly size?: string | number
  readonly minSize?: string | number
  readonly maxSize?: string | number
  readonly collapsible?: boolean
  readonly collapsed?: boolean
  readonly scrollable?: boolean
  readonly resizable?: boolean
  readonly content: ContentSchema
  readonly responsive?: ResponsiveConfig
  readonly className?: string
  readonly i18n?: I18nConfig
}