import type { InputHTMLAttributes } from 'react'
import { useCallback, useRef, useState } from 'react'

interface TagOption {
  readonly label: string
  readonly value: string
}

export interface TagInputProps {
  readonly value: readonly string[]
  readonly onChange: (value: readonly string[]) => void
  readonly options?: readonly TagOption[]
  readonly maxSelections?: number
  readonly creatable?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

type TagInputInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'placeholder' | 'disabled'
>

export function TagInput({
  value,
  onChange,
  options = [],
  maxSelections,
  creatable = false,
  placeholder = 'Add tag...',
  disabled = false,
  ...inputProps
}: TagInputProps & TagInputInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isAtLimit = maxSelections !== undefined && value.length >= maxSelections

  const filteredOptions = options.filter(
    opt => !value.includes(opt.value) && opt.label.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const exactMatch = options.some(
    opt =>
      opt.label.toLowerCase() === inputValue.trim().toLowerCase() ||
      opt.value.toLowerCase() === inputValue.trim().toLowerCase(),
  )

  const canCreate = creatable && inputValue.trim() !== '' && !exactMatch && !isAtLimit

  const addTag = useCallback(
    (tagValue: string) => {
      if (disabled || isAtLimit) return
      if (value.includes(tagValue)) return
      onChange([...value, tagValue])
      setInputValue('')
      setShowDropdown(false)
    },
    [disabled, isAtLimit, value, onChange],
  )

  const removeTag = useCallback(
    (tagValue: string) => {
      if (disabled) return
      onChange(value.filter(v => v !== tagValue))
    },
    [disabled, value, onChange],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowDropdown(true)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        addTag(filteredOptions[0].value)
      } else if (canCreate) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleFocus = () => {
    if (!disabled) setShowDropdown(true)
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const getLabelForValue = (tagValue: string): string => {
    const option = options.find(opt => opt.value === tagValue)
    return option?.label ?? tagValue
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={handleContainerClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleContainerClick()
          }
        }}
        className={`flex flex-wrap gap-1.5 items-center min-h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background cursor-text ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
        }`}
      >
        {value.map(tagValue => (
          <span
            key={tagValue}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium"
          >
            {getLabelForValue(tagValue)}
            {!disabled && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  removeTag(tagValue)
                }}
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 leading-none text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${getLabelForValue(tagValue)}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!isAtLimit && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleFocus}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 150)
            }}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            {...inputProps}
          />
        )}
        {isAtLimit && (
          <span className="text-xs text-muted-foreground">Max {maxSelections} selected</span>
        )}
      </div>

      {showDropdown && !disabled && (filteredOptions.length > 0 || canCreate) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-48 overflow-y-auto">
          {filteredOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                addTag(opt.value)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {opt.label}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                addTag(inputValue.trim())
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-t italic"
            >
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
