export function validateFieldValue(
  _value: unknown,
  field: { required?: boolean; validation?: { type: string; value?: string | number; message: string }[] }
): string | null {
  if (field.required && (_value === undefined || _value === null || _value === '')) {
    return 'This field is required'
  }

  if (field.validation) {
    for (const rule of field.validation) {
      const val = _value as string | number | undefined

      switch (rule.type) {
        case 'minLength':
          if (typeof val === 'string' && val.length < (rule.value as number)) {
            return rule.message
          }
          break
        case 'maxLength':
          if (typeof val === 'string' && val.length > (rule.value as number)) {
            return rule.message
          }
          break
        case 'min':
          if (typeof val === 'number' && val < (rule.value as number)) {
            return rule.message
          }
          break
        case 'max':
          if (typeof val === 'number' && val > (rule.value as number)) {
            return rule.message
          }
          break
        case 'email':
          if (
            typeof val === 'string' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ) {
            return rule.message
          }
          break
        case 'pattern':
          if (
            typeof val === 'string' &&
            typeof rule.value === 'string' &&
            !new RegExp(rule.value).test(val)
          ) {
            return rule.message
          }
          break
      }
    }
  }

  return null
}