export interface I18nConfig {
  readonly locale: string
  readonly messages?: Readonly<Record<string, string>>
}