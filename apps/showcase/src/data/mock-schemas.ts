import type { FormSchema, GridSchema } from '@my-framework/core'

export const contactFormSchema: FormSchema = {
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
}

export const userGridSchema: GridSchema = {
  title: 'Users',
  description: 'Manage user accounts and roles.',
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', type: 'status', sortable: true },
    { key: 'active', label: 'Active', type: 'boolean', width: '80px', align: 'center' },
  ],
  dataKey: 'id',
  striped: true,
  hoverable: true,
  emptyMessage: 'No users found.',
}

export const mockUsers: Record<string, unknown>[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', active: true },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', active: false },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', active: true },
  { id: 5, name: 'Eve Williams', email: 'eve@example.com', role: 'Admin', active: true },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', active: false },
]