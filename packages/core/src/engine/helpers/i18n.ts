import type { I18nConfig } from '../types'

export function resolveMessage(
  key: string,
  i18n: I18nConfig | undefined,
  fallback: string
): string {
  return i18n?.messages?.[key] ?? fallback
}