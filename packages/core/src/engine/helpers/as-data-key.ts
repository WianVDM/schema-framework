import type { DataKey } from '../types/branded'

/**
 * Constructs a branded DataKey from a string value.
 * Use this instead of `as DataKey` casts when building GridSchema objects.
 */
export function asDataKey(value: string): DataKey {
  if (value.length === 0) {
    throw new Error('DataKey must be a non-empty string')
  }
  return value as DataKey
}