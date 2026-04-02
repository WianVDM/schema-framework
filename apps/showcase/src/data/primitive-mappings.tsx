import type { PrimitiveComponents } from '@my-framework/core'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

// NOTE: This file is the ONLY place where shadcn/ui components are wired into
// the core engine's PrimitiveComponents interface. Per the Shadcn Dependency Rule,
// packages/core never imports shadcn directly.

function Textarea({
  ref,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      ref={ref}
      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      {...props}
    />
  )
}

function Checkbox({
  ref,
  checked,
  onCheckedChange,
  ...props
}: {
  ref?: React.Ref<HTMLButtonElement>
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={`h-4 w-4 shrink-0 rounded-sm border border-primary shadow ${
        checked ? 'bg-primary text-primary-foreground' : 'bg-background'
      } ${props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      {...props}
    />
  )
}

export const primitives: PrimitiveComponents = {
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Label,
  Textarea,
  Checkbox,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
}