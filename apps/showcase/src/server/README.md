# server

## Purpose

Mock TanStack server functions that return fake JSON schemas and business data for development and demonstration purposes. Each server function lives in its own file following the one-export-per-file convention.

## Files

| File | Export | Description |
|------|--------|-------------|
| get-contact-form-schema.ts | getContactFormSchema | Returns contact form schema |
| get-user-grid-schema.ts | getUserGridSchema | Returns user grid schema |
| get-order-grid-schema.ts | getOrderGridSchema | Returns order grid schema |
| get-registration-form-schema.ts | getRegistrationFormSchema | Returns registration form schema |
| get-support-ticket-form-schema.ts | getSupportTicketFormSchema | Returns support ticket form schema |
| get-users.ts | getUsers | Returns mock user data |
| get-orders.ts | getOrders | Returns mock order data |

## Dependencies (Imports FROM)

- `@tanstack/react-start` (for `createServerFn`)
- `@my-framework/core` (for schema types)
- Individual data files from `../data/` (e.g., `../data/contact-form-schema`)

## Dependents (Imported BY)

- `apps/showcase/src/routes/` — routes call these server functions via `useQuery`

## Constraints

- Functions must use `createServerFn` from `@tanstack/react-start`
- All data returned is mock/static — no real database connections
- Keep server functions thin; actual schema definitions live in `../data/`
- Each file exports exactly one server function

## 🚫 FORBIDDEN

- DO NOT import shadcn/ui components here
- DO NOT import from `@my-framework/core` engine renderers
- DO NOT connect to real databases or external APIs