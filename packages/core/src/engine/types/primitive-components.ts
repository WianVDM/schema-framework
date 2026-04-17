import type { ComponentType } from 'react'

/**
 * Type alias for primitive component slots.
 *
 * NOTE: Primitives are passed from the showcase app where shadcn components have varying
 * prop signatures. Using `any` here is intentional: the adapter pattern accepts any component
 * and type safety is enforced at the renderer call-site instead.
 */
// biome-ignore lint/suspicious/noExplicitAny: shadcn adapter pattern — type safety at call-site
type AnyComponent = ComponentType<any>

export interface PrimitiveComponents {
  readonly Input: AnyComponent
  readonly Select: AnyComponent
  readonly SelectTrigger: AnyComponent
  readonly SelectContent: AnyComponent
  readonly SelectItem: AnyComponent
  readonly SelectValue: AnyComponent
  readonly Label: AnyComponent
  readonly Textarea: AnyComponent
  readonly Checkbox: AnyComponent
  readonly Table: AnyComponent
  readonly TableHeader: AnyComponent
  readonly TableBody: AnyComponent
  readonly TableRow: AnyComponent
  readonly TableHead: AnyComponent
  readonly TableCell: AnyComponent
  readonly Button: AnyComponent
  readonly Badge: AnyComponent
  readonly Dialog: AnyComponent
  readonly DialogContent: AnyComponent
  readonly DialogTrigger: AnyComponent
  readonly DropdownMenu: AnyComponent
  readonly DropdownMenuTrigger: AnyComponent
  readonly DropdownMenuContent: AnyComponent
  readonly DropdownMenuItem: AnyComponent
  readonly FileUpload: AnyComponent
  readonly AddressInput: AnyComponent
  readonly DatePicker?: AnyComponent
  readonly TagInput?: AnyComponent
  readonly StepIndicator?: AnyComponent
}
