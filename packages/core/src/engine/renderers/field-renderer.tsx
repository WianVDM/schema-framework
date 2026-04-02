import type { FieldRendererProps, SelectOption } from '../types'
import { usePrimitives } from '../context/primitives-context'

export function FieldRenderer({ schema, value, onChange, error }: FieldRendererProps) {
  const {
    Input,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    Label,
    Textarea,
    Checkbox,
  } = usePrimitives()

  const fieldId = `field-${schema.name}`
  const errorId = `${fieldId}-error`

  const labelElement = (
    <Label htmlFor={fieldId}>
      {schema.label}
      {schema.required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )

  const errorElement = error ? (
    <p id={errorId} className="text-sm text-destructive mt-1">
      {error}
    </p>
  ) : null

  const descriptionElement = schema.description ? (
    <p className="text-sm text-muted-foreground">{schema.description}</p>
  ) : null

  switch (schema.type) {
    case 'select': {
      const options = normalizeOptions(schema.options)
      return (
        <div className="space-y-1">
          {labelElement}
          <Select
            value={value ?? ''}
            onValueChange={(val: string) => onChange(val)}
            disabled={schema.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={schema.placeholder ?? 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {descriptionElement}
          {errorElement}
        </div>
      )
    }

    case 'textarea':
      return (
        <div className="space-y-1">
          {labelElement}
          <Textarea
            id={fieldId}
            value={value ?? ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onChange(e.target.value)
            }
            placeholder={schema.placeholder}
            disabled={schema.disabled}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )

    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={fieldId}
            checked={Boolean(value)}
            onCheckedChange={(checked: boolean) => onChange(checked)}
            disabled={schema.disabled}
          />
          {labelElement}
          {errorElement}
        </div>
      )

    case 'text':
    case 'email':
    case 'number':
    case 'date':
    case 'password':
    default:
      return (
        <div className="space-y-1">
          {labelElement}
          <Input
            id={fieldId}
            type={schema.type === 'email' ? 'email' : schema.type === 'number' ? 'number' : schema.type === 'date' ? 'date' : schema.type === 'password' ? 'password' : 'text'}
            value={value ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newVal =
                schema.type === 'number'
                  ? e.target.value === ''
                    ? ''
                    : Number(e.target.value)
                  : e.target.value
              onChange(newVal)
            }}
            placeholder={schema.placeholder}
            disabled={schema.disabled}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )
  }
}

function normalizeOptions(
  options?: string[] | SelectOption[]
): SelectOption[] {
  if (!options) return []
  return options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
}