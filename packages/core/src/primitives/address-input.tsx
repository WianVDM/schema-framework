// Layer 1: AddressInput primitive
// Composite address input (street, city, state, zip, country).
// Knows nothing about schemas — accepts standard controlled props.

export interface AddressData {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

interface AddressInputProps {
  value: AddressData
  onChange: (value: AddressData) => void
  disabled?: boolean
}

export function AddressInput({ value, onChange, disabled }: AddressInputProps) {
  const handleChange = (field: keyof AddressData, newValue: string) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Street Address"
          value={value.street ?? ''}
          onChange={(e) => handleChange('street', e.target.value)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <input
        type="text"
        placeholder="City"
        value={value.city ?? ''}
        onChange={(e) => handleChange('city', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        type="text"
        placeholder="State / Province"
        value={value.state ?? ''}
        onChange={(e) => handleChange('state', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        type="text"
        placeholder="ZIP / Postal Code"
        value={value.zip ?? ''}
        onChange={(e) => handleChange('zip', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        type="text"
        placeholder="Country"
        value={value.country ?? ''}
        onChange={(e) => handleChange('country', e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}