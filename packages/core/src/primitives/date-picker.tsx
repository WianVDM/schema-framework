// Layer 1: DatePicker primitive
// Self-contained date picker using date-fns + react-day-picker.
// Knows nothing about schemas — accepts standard controlled props.

import { useState, useCallback, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid, isBefore, isAfter, startOfDay } from 'date-fns'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  disabled?: boolean
  placeholder?: string
  formatStr?: string
  minDate?: string
  maxDate?: string
  id?: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick a date...',
  formatStr = 'yyyy-MM-dd',
  minDate,
  maxDate,
  id,
  ...ariaProps
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ?? '')

  const parsedDate = useMemo(() => {
    if (!value) return undefined
    const d = parse(value, formatStr, new Date())
    return isValid(d) ? d : undefined
  }, [value, formatStr])

  const minDateParsed = useMemo(() => {
    if (!minDate) return undefined
    const d = parse(minDate, formatStr, new Date())
    return isValid(d) ? startOfDay(d) : undefined
  }, [minDate, formatStr])

  const maxDateParsed = useMemo(() => {
    if (!maxDate) return undefined
    const d = parse(maxDate, formatStr, new Date())
    return isValid(d) ? startOfDay(d) : undefined
  }, [maxDate, formatStr])

  const handleDaySelect = useCallback((date: Date | undefined) => {
    if (!date || disabled) return
    if (minDateParsed && isBefore(date, minDateParsed)) return
    if (maxDateParsed && isAfter(date, maxDateParsed)) return

    const formatted = format(date, formatStr)
    onChange(formatted)
    setInputValue(formatted)
    setIsOpen(false)
  }, [disabled, formatStr, minDateParsed, maxDateParsed, onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)

    if (!raw) {
      onChange('')
      return
    }

    const d = parse(raw, formatStr, new Date())
    if (isValid(d)) {
      if (minDateParsed && isBefore(d, minDateParsed)) return
      if (maxDateParsed && isAfter(d, maxDateParsed)) return
      onChange(format(d, formatStr))
    }
  }, [formatStr, minDateParsed, maxDateParsed, onChange])

  const handleToggle = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev)
  }, [disabled])

  const handleBlur = useCallback(() => {
    if (inputValue && !parsedDate) {
      setInputValue(value ?? '')
    }
  }, [inputValue, parsedDate, value])

  const buttonClassName = `w-full rounded-md border px-3 py-2 text-sm text-left ${
    disabled
      ? 'opacity-50 cursor-not-allowed bg-muted'
      : 'cursor-pointer bg-background hover:bg-accent'
  } ${ariaProps['aria-invalid'] ? 'border-destructive' : 'border-input'}`

  return (
    <div className="relative">
      <div className="flex">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={ariaProps['aria-required']}
          aria-invalid={ariaProps['aria-invalid']}
          aria-describedby={ariaProps['aria-describedby']}
          className="w-full rounded-l-md border px-3 py-2 text-sm bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`rounded-r-md border border-l-0 px-3 py-2 text-sm ${
            disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer bg-background hover:bg-accent'
          }`}
          aria-label="Toggle calendar"
        >
          📅
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 rounded-md border bg-popover p-3 shadow-md">
          <DayPicker
            mode="single"
            selected={parsedDate}
            onSelect={handleDaySelect}
            disabled={[
              ...(minDateParsed ? [{ before: minDateParsed }] : []),
              ...(maxDateParsed ? [{ after: maxDateParsed }] : []),
            ]}
          />
        </div>
      )}
    </div>
  )
}