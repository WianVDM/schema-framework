/** Configuration for accordion layout behavior */
export interface AccordionConfig {
  /** Whether one or multiple items can be expanded simultaneously */
  readonly mode?: 'single' | 'multiple'
  /** Animation style for expand/collapse transitions */
  readonly animation?: 'slide' | 'fade' | 'none'
  /** Region IDs that should be expanded by default */
  readonly defaultOpen?: readonly string[]
  /** Whether expanded items can be collapsed (only applies to single mode) */
  readonly collapsible?: boolean
}
