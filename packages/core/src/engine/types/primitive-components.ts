import type { ComponentType } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any -- Primitives are passed from
   the showcase app where shadcn components have varying prop signatures.
   Using `any` here is intentional: the adapter pattern accepts any component
   and type safety is enforced at the renderer call-site instead. */

export interface PrimitiveComponents {
  readonly Input: ComponentType<any>
  readonly Select: ComponentType<any>
  readonly SelectTrigger: ComponentType<any>
  readonly SelectContent: ComponentType<any>
  readonly SelectItem: ComponentType<any>
  readonly SelectValue: ComponentType<any>
  readonly Label: ComponentType<any>
  readonly Textarea: ComponentType<any>
  readonly Checkbox: ComponentType<any>
  readonly Table: ComponentType<any>
  readonly TableHeader: ComponentType<any>
  readonly TableBody: ComponentType<any>
  readonly TableRow: ComponentType<any>
  readonly TableHead: ComponentType<any>
  readonly TableCell: ComponentType<any>
  readonly Button: ComponentType<any>
  readonly Badge: ComponentType<any>
  readonly Dialog: ComponentType<any>
  readonly DialogContent: ComponentType<any>
  readonly DialogTrigger: ComponentType<any>
  readonly DropdownMenu: ComponentType<any>
  readonly DropdownMenuTrigger: ComponentType<any>
  readonly DropdownMenuContent: ComponentType<any>
  readonly DropdownMenuItem: ComponentType<any>
  readonly FileUpload: ComponentType<any>
  readonly AddressInput: ComponentType<any>
}
