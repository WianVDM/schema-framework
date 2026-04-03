import type { ComponentType } from 'react'

export interface PrimitiveComponents {
  Input: ComponentType<Record<string, unknown>>
  Select: ComponentType<Record<string, unknown>>
  SelectTrigger: ComponentType<Record<string, unknown>>
  SelectContent: ComponentType<Record<string, unknown>>
  SelectItem: ComponentType<Record<string, unknown>>
  SelectValue: ComponentType<Record<string, unknown>>
  Label: ComponentType<Record<string, unknown>>
  Textarea: ComponentType<Record<string, unknown>>
  Checkbox: ComponentType<Record<string, unknown>>
  Table: ComponentType<Record<string, unknown>>
  TableHeader: ComponentType<Record<string, unknown>>
  TableBody: ComponentType<Record<string, unknown>>
  TableRow: ComponentType<Record<string, unknown>>
  TableHead: ComponentType<Record<string, unknown>>
  TableCell: ComponentType<Record<string, unknown>>
  Button: ComponentType<Record<string, unknown>>
  Badge: ComponentType<Record<string, unknown>>
  Dialog: ComponentType<Record<string, unknown>>
  DialogContent: ComponentType<Record<string, unknown>>
  DialogTrigger: ComponentType<Record<string, unknown>>
  DropdownMenu: ComponentType<Record<string, unknown>>
  DropdownMenuTrigger: ComponentType<Record<string, unknown>>
  DropdownMenuContent: ComponentType<Record<string, unknown>>
  DropdownMenuItem: ComponentType<Record<string, unknown>>
  FileUpload: ComponentType<Record<string, unknown>>
  AddressInput: ComponentType<Record<string, unknown>>
}