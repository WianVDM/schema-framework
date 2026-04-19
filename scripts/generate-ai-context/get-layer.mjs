/**
 * NOTE: Maps a directory path to its architectural layer number.
 * Layer 1 = Primitives, Layer 2 = Engine, Layer 3 = Composition.
 * Throws an Error for paths that don't match any known layer.
 */
export function getLayer(dirPath) {
  const norm = dirPath.replace(/\\/g, '/')
  if (norm.includes('packages/core/src/primitives')) return 1
  if (norm.includes('packages/core/src/engine')) return 2
  if (norm.includes('apps/showcase')) return 3
  throw new Error(`Unknown layer for path: "${dirPath}"`)
}

/**
 * NOTE: Returns default governance constraints for a given architectural layer.
 * Layer 1 (Primitives) cannot import from Layer 2 (Engine) or apps.
 * Layer 2 (Engine) cannot import from apps.
 * Layer 3 (Composition) has no cross-layer restrictions.
 */
export function getLayerConstraints(layer) {
  switch (layer) {
    case 1:
      return {
        forbidden: ['packages/core/src/engine/**', 'apps/**'],
        importsFrom: ['packages/core/src/primitives/**'],
      }
    case 2:
      return {
        forbidden: ['apps/**'],
        importsFrom: ['packages/core/src/primitives/**', 'packages/core/src/engine/**'],
      }
    case 3:
      return {
        forbidden: [],
        importsFrom: [],
      }
    default:
      return { forbidden: [], importsFrom: [] }
  }
}
