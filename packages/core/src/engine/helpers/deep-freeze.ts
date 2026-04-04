import type { DeepFrozen } from '../types/readonly-deep'

export function deepFreeze<T>(obj: T): DeepFrozen<T> {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as DeepFrozen<T>
  }

  if (Array.isArray(obj)) {
    for (const element of obj) {
      deepFreeze(element)
    }
  } else {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      deepFreeze(value)
    }
  }

  return Object.freeze(obj) as DeepFrozen<T>
}