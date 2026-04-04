import type { DeepFrozen } from '../types/readonly-deep'

export function deepFreeze<T>(obj: T, visited: WeakSet<object> = new WeakSet()): DeepFrozen<T> {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj as DeepFrozen<T>
  }

  if (visited.has(obj as object)) {
    return obj as DeepFrozen<T>
  }

  visited.add(obj as object)

  if (obj instanceof Map) {
    for (const value of (obj as Map<unknown, unknown>).values()) {
      deepFreeze(value, visited)
    }
    return Object.freeze(obj) as DeepFrozen<T>
  }

  if (obj instanceof Set) {
    for (const value of (obj as Set<unknown>)) {
      deepFreeze(value, visited)
    }
    return Object.freeze(obj) as DeepFrozen<T>
  }

  if (Array.isArray(obj)) {
    for (const element of obj) {
      deepFreeze(element, visited)
    }
  } else {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      deepFreeze(value, visited)
    }
  }

  return Object.freeze(obj) as DeepFrozen<T>
}