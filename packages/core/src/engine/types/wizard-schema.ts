import type { I18nConfig } from './i18n-config'
import type { ReviewStepConfig } from './review-step-config'
import type { WizardNavigationConfig } from './wizard-navigation-config'
import type { WizardStep } from './wizard-step'

export interface WizardSchema {
  readonly title?: string
  readonly description?: string
  readonly steps: readonly WizardStep[]
  readonly mode?: 'linear' | 'nonlinear'
  readonly validationMode?: 'eager' | 'lazy'
  readonly navigation?: WizardNavigationConfig
  readonly reviewStep?: ReviewStepConfig
  readonly i18n?: I18nConfig
}
