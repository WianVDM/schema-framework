import type { FormSchema } from '@my-framework/core'
import { deepFreeze } from '@my-framework/core'

export const contactFormSchema = deepFreeze<FormSchema>({
  title: 'Contact Us',
  description: 'Fill in the form below to get in touch.',
  fields: [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'you@example.com',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+27 82 123 4567',
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'select',
      required: true,
      options: [
        { label: 'General Inquiry', value: 'general' },
        { label: 'Technical Support', value: 'support' },
        { label: 'Sales', value: 'sales' },
        { label: 'Feedback', value: 'feedback' },
      ],
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      placeholder: 'How can we help you?',
      colSpan: 2,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: ['Low', 'Medium', 'High'],
    },
    {
      name: 'acceptTerms',
      label: 'I agree to the terms and conditions',
      type: 'checkbox',
      required: true,
    },
  ],
  submitLabel: 'Send Message',
  layout: 'grid',
})