/**
 * NOTE: Maps a directory path to its architectural layer number.
 * Layer 1 = Primitives, Layer 2 = Engine, Layer 3 = Composition.
 */
export function getLayer(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('packages/core/src/primitives')) return 1
  if (norm.includes('packages/core/src/engine')) return 2
  if (norm.includes('apps/showcase')) return 3
  throw new Error(`Unknown layer for directory: ${dirPath}`)
}