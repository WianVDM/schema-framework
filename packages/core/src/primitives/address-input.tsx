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

type RestProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder' | 'disabled' | 'id' | 'type'>

interface AddressInputProps extends RestProps {
  value: AddressData
  onChange: (value: AddressData) => void
  disabled?: boolean
  id?: string
  placeholder?: string
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
          placeholder={placeholder ? `${placeholder} Street` : 'Street Address'}
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
        placeholder={placeholder ? `${placeholder} City` : 'City'}
        value={value.city ?? ''}
        onChange={(e) => handleChange('city', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
      <input
        id={id ? `${id}-state` : undefined}
        type="text"
        placeholder={placeholder ? `${placeholder} State` : 'State / Province'}
        value={value.state ?? ''}
        onChange={(e) => handleChange('state', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
      <input
        id={id ? `${id}-zip` : undefined}
        type="text"
        placeholder={placeholder ? `${placeholder} ZIP` : 'ZIP / Postal Code'}
        value={value.zip ?? ''}
        onChange={(e) => handleChange('zip', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
      <input
        id={id ? `${id}-country` : undefined}
        type="text"
        placeholder={placeholder ? `${placeholder} Country` : 'Country'}
        value={value.country ?? ''}
        onChange={(e) => handleChange('country', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
    </div>
  )
}