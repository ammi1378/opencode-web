'use client'

import { useContext, useEffect } from 'react'
import {
  ArchiveX,
  ChevronRight,
  Command,
  File,
  Inbox,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'

import { Link, useMatch, useMatches } from '@tanstack/react-router'
import type { FileRouteTypes } from '@/routeTree.gen'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { useServers } from '@/lib/servers/hooks'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ServerContext } from '@/hooks/context/server-context'
import { useSessionList } from '@/lib/api/default/default'
import { Button } from '@/components/ui/button'

export function SessionSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const matchIsSessionChatPage = useMatch({
    from: '/servers/$serverId_/chat/$sessionId',
    shouldThrow: false,
  })
  const { selectedServer: server } = useContext(ServerContext)
  useEffect(() => {
    console.log({ server })
  }, [server])
  const { data: sessions } = useSessionList(
    {},
    {
      query: {
        enabled: !!server?.url?.length,
      },
      request: {
        baseUrl: server?.url,
      },
    },
  )

  console.log({ sessions, server })

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className='w-full' asChild>

              <Plus />
              New Chat</Button>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            {activeItem?.title}
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Type to search..." /> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions?.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton className="h-auto" asChild>
                    <Link
                      to="/servers/$serverId/chat/$sessionId"
                      params={{
                        serverId: server?.identifier?.toString()!,
                        sessionId: session.id,
                      }}
                      key={session.id}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                    >
                      <div className="flex w-full items-center gap-2">
                        <span className="whitespace-break-spaces">
                          {session.title}
                        </span>{' '}
                        <span className="ml-auto text-xs">
                          {new Date(session.time.created).toLocaleTimeString(
                            undefined,
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            },
                          )}
                          {/* {session.time.created} */}
                        </span>
                      </div>
                      <span className="font-medium">{session.directory}</span>
                      <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                        {session.projectID}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
