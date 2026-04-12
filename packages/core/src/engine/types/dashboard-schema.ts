import type { LayoutSchema } from './layout-schema'
import type { I18nConfig } from './i18n-config'

/** Top-level dashboard composition */
export interface DashboardSchema {
  readonly title?: string
  readonly description?: string
  readonly layout: LayoutSchema
  readonly className?: string
  readonly i18n?: I18nConfig
}