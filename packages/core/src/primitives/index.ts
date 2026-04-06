// Layer 1: Primitives
// NOTE: This layer exports generic UI wrappers. Per the Shadcn Dependency Rule,
// packages/core CANNOT import shadcn components directly. The Showcase app (Layer 3)
// wires shadcn primitives into the engine via PrimitivesContext.

export { StatusBadge } from './status-badge'
export { AddressInput } from './address-input'
export { DatePicker } from './date-picker'
export { TagInput } from './tag-input'
export type { AddressData } from './address-data'
export type { AddressPlaceholders } from './address-placeholders'
export { FileUpload } from './file-upload'
