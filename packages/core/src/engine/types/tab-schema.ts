import type { I18nConfig } from './i18n-config'
import type { TabItem } from './tab-item'

/** Tab container definition */
export interface TabSchema {
  readonly tabs: readonly TabItem[]
  readonly defaultTab?: string
  /** Mount strategy: 'eager' renders all tabs (hidden via CSS), 'lazy' only mounts active + previously activated */
  readonly mountMode?: 'eager' | 'lazy'
  readonly lazy?: boolean
  readonly className?: string
  readonly i18n?: I18nConfig
}
