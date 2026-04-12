import type { LayoutType } from './layout-type'
import type { LayoutRegion } from './layout-region'
import type { I18nConfig } from './i18n-config'

/** Top-level layout definition */
export interface LayoutSchema {
  readonly type: LayoutType
  readonly regions: readonly LayoutRegion[]
  readonly gap?: number
  readonly padding?: number | readonly [number, number]
  readonly className?: string
  readonly i18n?: I18nConfig
}