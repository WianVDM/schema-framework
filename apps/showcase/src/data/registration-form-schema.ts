import type { FormSchema } from '@my-framework/core'
import { deepFreeze } from '@my-framework/core'

export const registrationFormSchema = deepFreeze<FormSchema>({
  title: 'Registration Form',
  description: 'Advanced form with conditional fields and file upload.',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john@example.com',
    },
    {
      name: 'accountType',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
    },
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Acme Inc.',
      visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' },
      dependsOn: ['accountType'],
    },
    {
      name: 'companyRole',
      label: 'Your Role',
      type: 'select',
      options: ['Owner', 'Manager', 'Employee', 'Contractor'],
      visibleWhen: { field: 'accountType', operator: 'equals', value: 'business' },
      dependsOn: ['accountType'],
    },
    {
      name: 'document',
      label: 'Upload ID Document',
      type: 'file',
      description: 'Please upload a copy of your ID (max 5MB)',
      fileConfig: {
        accept: '.pdf,.jpg,.png',
        maxSize: 5242880,
        multiple: false,
      },
      colSpan: 2,
    },
    {
      name: 'newsletter',
      label: 'Subscribe to newsletter',
      type: 'checkbox',
    },
    {
      name: 'acceptTerms',
      label: 'I agree to the terms and conditions',
      type: 'checkbox',
      required: true,
    },
  ],
  submitLabel: 'Register',
  cancelLabel: 'Cancel',
  layout: 'grid',
})