// Layer 1: Primitives
// NOTE: This layer exports generic UI wrappers. Per the Shadcn Dependency Rule,
// packages/core CANNOT import shadcn components directly. The Showcase app (Layer 3)
// wires shadcn primitives into the engine via PrimitivesContext.

export { StatusBadge } from './status-badge'
export { AddressInput } from './address-input'
export type { AddressData } from './address-input'
export { FileUpload } from './file-upload'
