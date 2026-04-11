/**
 * NOTE: Infers a directory's category from its path segments.
 * Used by Tier 2 symbol indexes for categorization.
 */
export function inferCategory(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  const segments = norm.split('/')
  if (segments.includes('types')) return 'dto'
  if (segments.includes('renderers')) return 'component'
  if (segments.includes('validators')) return 'utility'
  if (segments.includes('primitives')) return 'component'
  if (segments.includes('helpers')) return 'utility'
  if (segments.includes('data')) return 'dto'
  if (segments.includes('routes')) return 'controller'
  if (segments.includes('server')) return 'service'
  if (segments.includes('stores')) return 'utility'
  if (segments.includes('context')) return 'config'
  if (segments.includes('lib')) return 'utility'
  if (segments.includes('components')) return 'component'
  return 'other'
}
