// Layer 1: Primitives
// NOTE: This layer exports generic UI wrappers. Per the Shadcn Dependency Rule,
// packages/core CANNOT import shadcn components directly. The Showcase app (Layer 3)
// wires shadcn primitives into the engine via PrimitivesContext.

export type { AddressData } from "./address-data";
export { AddressInput } from "./address-input";
export type { AddressPlaceholders } from "./address-placeholders";
export { DatePicker } from "./date-picker";
export { FileUpload } from "./file-upload";
export type { PanelProps } from "./panel";
// Layout primitives
export { Panel } from "./panel";
export type { SplitterProps } from "./splitter";
export { Splitter } from "./splitter";
export { StatusBadge } from "./status-badge";
export { TagInput } from "./tag-input";
