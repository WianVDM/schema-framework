// Layer 1: AddressInput primitive
// Composite address input (street, city, state, zip, country).
// Knows nothing about schemas — accepts standard controlled props.

import type { InputHTMLAttributes } from 'react'

export interface AddressData {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface AddressPlaceholders {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

type RestProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder' | 'disabled' | 'id' | 'type'>

interface AddressInputProps extends RestProps {
  value: AddressData
  onChange: (value: AddressData) => void
  disabled?: boolean
  id?: string
  placeholder?: string | AddressPlaceholders
}

const DEFAULT_PLACEHOLDERS: Record<keyof AddressData, string> = {
  street: 'Street Address',
  city: 'City',
  state: 'State / Province',
  zip: 'ZIP / Postal Code',
  country: 'Country',
}

function resolvePlaceholder(field: keyof AddressData, placeholder?: string | AddressPlaceholders): string {
  if (placeholder == null) return DEFAULT_PLACEHOLDERS[field]
  if (typeof placeholder === 'string') return `${placeholder} ${DEFAULT_PLACEHOLDERS[field]}`
  return placeholder[field] || DEFAULT_PLACEHOLDERS[field]
}

export function AddressInput({ value, onChange, disabled, id, placeholder, ...rest }: AddressInputProps) {
  const handleChange = (field: keyof AddressData, newValue: string) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
        <input
          id={id ? `${id}-street` : undefined}
          type="text"
          placeholder={resolvePlaceholder('street', placeholder)}
          value={value.street ?? ''}
          onChange={(e) => handleChange('street', e.target.value)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        />
      </div>
      <input
        id={id ? `${id}-city` : undefined}
        type="text"
        placeholder={resolvePlaceholder('city', placeholder)}
        value={value.city ?? ''}
        onChange={(e) => handleChange('city', e.target.value)}
        disabled={disabled}
        aria-label="City"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        id={id ? `${id}-state` : undefined}
        type="text"
        placeholder={resolvePlaceholder('state', placeholder)}
        value={value.state ?? ''}
        onChange={(e) => handleChange('state', e.target.value)}
        disabled={disabled}
        aria-label="State"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        id={id ? `${id}-zip` : undefined}
        type="text"
        placeholder={resolvePlaceholder('zip', placeholder)}
        value={value.zip ?? ''}
        onChange={(e) => handleChange('zip', e.target.value)}
        disabled={disabled}
        aria-label="ZIP"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        id={id ? `${id}-country` : undefined}
        type="text"
        placeholder={resolvePlaceholder('country', placeholder)}
        value={value.country ?? ''}
        onChange={(e) => handleChange('country', e.target.value)}
        disabled={disabled}
        aria-label="Country"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}