/**
 * NOTE: Infers a directory's category from its path segments.
 * Used by Tier 2 symbol indexes for categorization.
 */
export function inferCategory(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('/types')) return 'dto'
  if (norm.includes('/renderers')) return 'component'
  if (norm.includes('/validators')) return 'utility'
  if (norm.includes('/primitives')) return 'component'
  if (norm.includes('/helpers')) return 'utility'
  if (norm.includes('/data')) return 'dto'
  if (norm.includes('/routes')) return 'controller'
  if (norm.includes('/server')) return 'service'
  if (norm.includes('/stores')) return 'utility'
  if (norm.includes('/context')) return 'config'
  if (norm.includes('/lib')) return 'utility'
  if (norm.includes('/components')) return 'component'
  return 'other'
}