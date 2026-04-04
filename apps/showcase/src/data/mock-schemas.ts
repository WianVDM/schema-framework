import type { FormSchema, GridSchema } from '@my-framework/core'
import { deepFreeze, asDataKey } from '@my-framework/core'
import type { UserRow } from './user-row'
import type { OrderRow } from './order-row'

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

export const userGridSchema = deepFreeze<GridSchema>({
  title: 'Users',
  description: 'Manage user accounts and roles.',
  columns: [
    { key: 'id', label: 'ID', type: 'number', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', sortable: true, filterable: true, resizable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true, resizable: true },
    {
      key: 'role',
      label: 'Role',
      type: 'status',
      sortable: true,
      filterable: true,
      statusConfig: {
        variants: {
          admin: { label: 'Admin', className: 'bg-blue-100 text-blue-800' },
          editor: { label: 'Editor', className: 'bg-green-100 text-green-800' },
          viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
        },
      },
    },
    { key: 'active', label: 'Active', type: 'boolean', width: '80px', align: 'center' },
  ],
  dataKey: asDataKey('id'),
  striped: true,
  hoverable: true,
  emptyMessage: 'No users found.',
  pagination: { pageSize: 5, pageSizeOptions: [5, 10, 25], showPageSizeSelector: true },
  resizable: true,
  columnVisibility: {},
})

export const mockUsers = deepFreeze<readonly UserRow[]>([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'editor', active: true },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', active: false },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'editor', active: true },
  { id: 5, name: 'Eve Williams', email: 'eve@example.com', role: 'admin', active: true },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'viewer', active: false },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'editor', active: true },
  { id: 8, name: 'Henry Davis', email: 'henry@example.com', role: 'viewer', active: true },
  { id: 9, name: 'Irene Chen', email: 'irene@example.com', role: 'admin', active: false },
  { id: 10, name: 'Jack Wilson', email: 'jack@example.com', role: 'editor', active: true },
  { id: 11, name: 'Karen Taylor', email: 'karen@example.com', role: 'viewer', active: false },
  { id: 12, name: 'Leo Martin', email: 'leo@example.com', role: 'admin', active: true },
])

export const orderGridSchema = deepFreeze<GridSchema>({
  title: 'Orders',
  description: 'Track and manage customer orders.',
  columns: [
    { key: 'orderId', label: 'Order #', type: 'number', sortable: true, width: '90px' },
    { key: 'customer', label: 'Customer', sortable: true, filterable: true },
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'total', label: 'Total', type: 'number', sortable: true, align: 'right' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      statusConfig: {
        variants: {
          pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800' },
          shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
          delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
        },
      },
    },
  ],
  dataKey: asDataKey('orderId'),
  striped: true,
  hoverable: true,
  bordered: false,
  pagination: true,
  emptyMessage: 'No orders found.',
})

export const mockOrders = deepFreeze<readonly OrderRow[]>([
  { orderId: 1001, customer: 'Alice Johnson', date: '2026-03-15', total: 249.99, status: 'delivered' },
  { orderId: 1002, customer: 'Bob Smith', date: '2026-03-18', total: 89.50, status: 'shipped' },
  { orderId: 1003, customer: 'Charlie Brown', date: '2026-03-20', total: 1249.00, status: 'processing' },
  { orderId: 1004, customer: 'Diana Prince', date: '2026-03-22', total: 45.00, status: 'pending' },
  { orderId: 1005, customer: 'Eve Williams', date: '2026-03-22', total: 599.99, status: 'cancelled' },
  { orderId: 1006, customer: 'Frank Miller', date: '2026-03-25', total: 175.00, status: 'shipped' },
  { orderId: 1007, customer: 'Grace Lee', date: '2026-03-28', total: 320.50, status: 'delivered' },
  { orderId: 1008, customer: 'Henry Davis', date: '2026-04-01', total: 67.00, status: 'pending' },
])

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