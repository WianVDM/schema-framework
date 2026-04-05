import type { FormSchema } from '@my-framework/core'
import { deepFreeze } from '@my-framework/core'

export const supportTicketFormSchema = deepFreeze<FormSchema>({
  title: 'Support Ticket',
  description: 'Submit a support request with conditional priority details.',
  fields: [
    {
      name: 'title',
      label: 'Ticket Title',
      type: 'text',
      required: true,
      placeholder: 'Brief description of the issue',
      colSpan: 2,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Bug Report', value: 'bug' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'Account Issue', value: 'account' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      name: 'deadline',
      label: 'Deadline',
      type: 'date',
      visibleWhen: { field: 'priority', operator: 'in', value: ['high', 'critical'] },
      dependsOn: ['priority'],
    },
    {
      name: 'impactDescription',
      label: 'Business Impact',
      type: 'textarea',
      placeholder: 'Describe the business impact of this issue',
      visibleWhen: { field: 'priority', operator: 'in', value: ['high', 'critical'] },
      dependsOn: ['priority'],
      colSpan: 2,
    },
    {
      name: 'description',
      label: 'Full Description',
      type: 'textarea',
      required: true,
      placeholder: 'Provide all relevant details...',
      colSpan: 2,
    },
    {
      name: 'attachment',
      label: 'Attach Screenshot',
      type: 'file',
      fileConfig: {
        accept: '.png,.jpg,.jpeg,.gif',
        maxSize: 2097152,
        multiple: true,
      },
      colSpan: 2,
    },
  ],
  submitLabel: 'Submit Ticket',
  cancelLabel: 'Cancel',
  layout: 'grid',
})