import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { useSSEStream } from '@/hooks/use-event-subscibe'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
      useSSEStream({
        endpoint: `http://0.0.0.0:56050/event`,
        queryKey: ['activity-log'],
        maxItems: 100,
      })
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': '350px',
            '--sidebar-total-width': '1000px',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="h-screen overflow-hidden">
          <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </header>
          <main className="adasds flex flex-1 flex-col gap-4 p-4 grow overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      </SidebarProvider>
    )
  },
})
