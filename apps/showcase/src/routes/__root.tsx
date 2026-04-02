/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import appCss from '../app/app.css?url'
import { AppPrimitivesProvider } from '../app/primitives-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Schema Framework Showcase' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <AppPrimitivesProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </AppPrimitivesProvider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <nav className="border-b px-6 py-3 flex gap-4 items-center">
          <h1 className="font-bold text-lg">Schema Framework</h1>
          <Link
            to="/"
            activeProps={{ className: 'font-bold underline' }}
            activeOptions={{ exact: true }}
            className="text-sm hover:underline"
          >
            Home
          </Link>
          <Link
            to="/demo"
            activeProps={{ className: 'font-bold underline' }}
            className="text-sm hover:underline"
          >
            Demo
          </Link>
          <Link
            to="/demo-form"
            activeProps={{ className: 'font-bold underline' }}
            className="text-sm hover:underline"
          >
            Form
          </Link>
          <Link
            to="/demo-grid"
            activeProps={{ className: 'font-bold underline' }}
            className="text-sm hover:underline"
          >
            Grid
          </Link>
        </nav>
        <main className="p-6">
          {children}
        </main>
        <Scripts />
      </body>
    </html>
  )
}
