import { DatePicker } from '@my-framework/core'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/demo-date-picker')({
  component: DatePickerDemoPage,
})

function DatePickerDemoPage() {
  const [basicDate, setBasicDate] = useState('')
  const [formattedDate, setFormattedDate] = useState('')
  const [constrainedDate, setConstrainedDate] = useState('')

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">DatePicker Primitive Demo</h2>
        <p className="text-muted-foreground mb-6">
          Self-contained date picker using date-fns + react-day-picker. Layer 1 primitive — no
          schema knowledge required.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Date Picker</h3>
        <p className="text-sm text-muted-foreground">
          Default format (yyyy-MM-dd). Type in the input or click the calendar icon.
        </p>
        <div className="max-w-xs">
          <DatePicker value={basicDate} onChange={setBasicDate} placeholder="Pick a date..." />
        </div>
        <p className="text-sm">
          Value: <code className="bg-muted px-1 rounded">{basicDate || '(empty)'}</code>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Format</h3>
        <p className="text-sm text-muted-foreground">Using dd/MM/yyyy format string.</p>
        <div className="max-w-xs">
          <DatePicker
            value={formattedDate}
            onChange={setFormattedDate}
            formatStr="dd/MM/yyyy"
            placeholder="dd/MM/yyyy"
          />
        </div>
        <p className="text-sm">
          Value: <code className="bg-muted px-1 rounded">{formattedDate || '(empty)'}</code>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Constrained Date Range</h3>
        <p className="text-sm text-muted-foreground">
          Min: 2025-01-01, Max: 2025-12-31. Dates outside range are disabled in the calendar.
        </p>
        <div className="max-w-xs">
          <DatePicker
            value={constrainedDate}
            onChange={setConstrainedDate}
            minDate="2025-01-01"
            maxDate="2025-12-31"
            placeholder="Select a 2025 date..."
          />
        </div>
        <p className="text-sm">
          Value: <code className="bg-muted px-1 rounded">{constrainedDate || '(empty)'}</code>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <p className="text-sm text-muted-foreground">DatePicker in disabled state.</p>
        <div className="max-w-xs">
          <DatePicker
            value="2025-06-15"
            onChange={() => {
              /* no-op */
            }}
            disabled={true}
          />
        </div>
      </div>
    </div>
  )
}
