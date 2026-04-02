// Layer 1: StatusBadge primitive
// Generic badge component for displaying status values with color coding.
// Knows nothing about schemas — accepts standard props only.

const defaultVariantClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
}

interface StatusBadgeProps {
  variant?: string
  label: string
  className?: string
}

export function StatusBadge({ variant = 'default', label, className }: StatusBadgeProps) {
  const variantClasses = defaultVariantClasses[variant] ?? defaultVariantClasses.default

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        className ?? variantClasses
      }`}
    >
      {label}
    </span>
  )
}