import type { FieldRendererProps, SelectOption } from '../types'
import type { AddressData } from '../../primitives/address-data'
import { useEffect } from 'react'
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
    FileUpload,
    AddressInput,
    DatePicker,
    TagInput,
  } = usePrimitives()

  const fieldId = `field-${schema.name}`
  const errorId = `${fieldId}-error`
  const descriptionId = `${fieldId}-description`

  const describedBy = [error ? errorId : null, schema.description ? descriptionId : null]
    .filter(Boolean)
    .join(' ') || undefined

  const ariaProps = {
    'aria-required': schema.required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  }

  const labelElement = (
    <Label htmlFor={fieldId}>
      {schema.label}
      {schema.required && <span className="text-destructive ml-1">*</span>}
    </Label>
  )

  const errorElement = error ? (
    <p id={errorId} role="alert" className="text-sm text-destructive mt-1">
      {error}
    </p>
  ) : null

  const descriptionElement = schema.description ? (
    <p id={descriptionId} className="text-sm text-muted-foreground">
      {schema.description}
    </p>
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
            <SelectTrigger id={fieldId} {...ariaProps}>
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
            {...ariaProps}
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
            {...ariaProps}
          />
          {labelElement}
          {descriptionElement}
          {errorElement}
        </div>
      )

    case 'file':
      return (
        <div className="space-y-1">
          {labelElement}
          <FileUpload
            accept={schema.fileConfig?.accept}
            maxSize={schema.fileConfig?.maxSize}
            multiple={schema.fileConfig?.multiple}
            value={Array.isArray(value) ? (value as File[]) : []}
            onChange={(files: File[]) => onChange(files)}
            disabled={schema.disabled}
            {...ariaProps}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )

    case 'address':
      return (
        <div className="space-y-1">
          <Label htmlFor={`${fieldId}-street`}>
            {schema.label}
            {schema.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <AddressInput
            id={fieldId}
            value={(value as AddressData) ?? { street: '', city: '', state: '', zip: '', country: '' }}
            onChange={(val: AddressData) => onChange(val)}
            disabled={schema.disabled}
            placeholder={schema.placeholder}
            {...ariaProps}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )

    case 'date': {
      const DatePickerComponent = DatePicker ?? (() => null)
      return (
        <div className="space-y-1">
          {labelElement}
          <DatePickerComponent
            id={fieldId}
            value={typeof value === 'string' ? value : ''}
            onChange={(date: string) => onChange(date)}
            disabled={schema.disabled}
            placeholder={schema.dateConfig?.placeholder ?? schema.placeholder ?? 'Pick a date...'}
            formatStr={schema.dateConfig?.format}
            minDate={schema.dateConfig?.minDate}
            maxDate={schema.dateConfig?.maxDate}
            {...ariaProps}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )
    }

    case 'multiselect': {
      const TagInputComponent = TagInput ?? DefaultTagInput
      const selectedValues = Array.isArray(value)
        ? (value as readonly unknown[]).filter((item): item is string => typeof item === 'string')
        : []
      return (
        <div className="space-y-1">
          {labelElement}
          <TagInputComponent
            id={fieldId}
            value={selectedValues}
            onChange={(newValues: readonly string[]) => onChange(newValues)}
            options={schema.multiSelectConfig?.options}
            maxSelections={schema.multiSelectConfig?.maxSelections}
            creatable={schema.multiSelectConfig?.creatable}
            placeholder={schema.multiSelectConfig?.placeholder ?? schema.placeholder ?? 'Select tags...'}
            disabled={schema.disabled}
            {...ariaProps}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )
    }

    case 'text':
    case 'email':
    case 'number':
    case 'password':
    default:
      return (
        <div className="space-y-1">
          {labelElement}
          <Input
            id={fieldId}
            type={schema.type === 'email' ? 'email' : schema.type === 'number' ? 'number' : schema.type === 'password' ? 'password' : 'text'}
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
            {...ariaProps}
          />
          {descriptionElement}
          {errorElement}
        </div>
      )
  }
}

function DefaultTagInput({ placeholder }: { readonly placeholder?: string } & Record<string, unknown>) {
  useEffect(() => {
    console.warn(
      'TagInput primitive not provided. Pass a TagInput component via PrimitiveComponents to enable multiselect fields.',
    )
  }, [])
  return (
    <div className="flex items-center min-h-10 px-3 py-2 rounded-md border border-dashed border-muted-foreground/50 bg-muted/50 text-sm text-muted-foreground">
      {placeholder ?? 'TagInput not configured'}
    </div>
  )
}

function normalizeOptions(
  options?: readonly (string | SelectOption)[]
): SelectOption[] {
  if (!options) return []
  return options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
}
