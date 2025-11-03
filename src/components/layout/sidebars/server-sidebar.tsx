'use client'

import * as React from 'react'
import {
  ArchiveX,
  ChevronRight,
  Command,
  File,
  Inbox,
  Send,
  Trash2,
} from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { Link, useMatch, useMatches } from '@tanstack/react-router'
import type { FileRouteTypes } from '@/routeTree.gen'
import { useServers } from '@/lib/servers/hooks'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export function ServerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const match = useMatch({ from: '/servers/$serverId', shouldThrow: false })
  const matchIsSessionsPage = useMatch({ from: '/servers/$serverId/sessions', shouldThrow: false })

  console.log({ match })
  //  (['/servers', '/servers/$serverId'] satisfies FileRouteTypes['fullPaths'][]).includes(currentMatch?.fullPath)
  const { servers } = useServers()
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
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
        <SidebarGroup className="px-0">
          {servers.map((server) => {
            const isActive =
              match?.params.serverId === server.identifier.toString()
            return (
              <Collapsible key={server.id} asChild open={isActive}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={server.name}
                    isActive={isActive}
                  >
                    <Link
                      to="/servers/$serverId"
                      params={{ serverId: server.identifier.toString() }}
                    >
                      {/* <item.icon /> */}
                      <span>{server.name}</span>
                    </Link>
                  </SidebarMenuButton>

                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={!!matchIsSessionsPage}>
                          <Link
                            to="/servers/$serverId/sessions"
                            params={{ serverId: server.identifier.toString() }}
                          >
                            {/* <item.icon /> */}
                            <span>Sessions</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href={'#'}>
                            <span>Agents2</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
