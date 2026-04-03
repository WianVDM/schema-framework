export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom'
  value?: string | number
  message: string
}