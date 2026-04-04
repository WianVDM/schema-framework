export interface StatusConfig {
  readonly variants: Readonly<Record<string, { readonly label: string; readonly className: string }>>
}