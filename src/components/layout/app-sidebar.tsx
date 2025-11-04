'use client'

import * as React from 'react'
import {
  ArchiveX,
  Command,
  File,
  FolderKanban,
  Inbox,
  Send,
  Trash2,
} from 'lucide-react'

import { Link, useMatch, useMatches } from '@tanstack/react-router'
import { NavUser } from './nav-user'
import { ServerSidebar } from './sidebars/server-sidebar'
import { SessionSidebar } from './sidebars/session-sidebar'
import type { FileRouteTypes } from '@/routeTree.gen'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const matches = useMatches()

  const currentMatch = matches.at(-1)
  const isServerAddress = (
    [
      '/servers',
      '/servers/$serverId/',
      '/servers/',
      '/servers/$serverId/sessions',
    ] as Array<FileRouteTypes['fullPaths']>
  ).some((p) => p === currentMatch?.fullPath)

    const isSessionAddress = (
    [
      '/servers/$serverId/chat/$sessionId',
      '/servers/$serverId/chat/new',
      
    ] as Array<FileRouteTypes['fullPaths']>
  ).some((p) => p === currentMatch?.fullPath)


  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="offcanvas"
        className="max-w-[calc(var(--sidebar-width-icon)+1px)]! xl:max-w-[calc(var(--xl-sidebar-width-icon)+1px)]! transition-[max-width] duration-200 border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: 'View servers',
                      hidden: false,
                    }}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link to="/servers">
                      <FolderKanban />
                      <span>Servers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {isServerAddress && <ServerSidebar />}
      {isSessionAddress && <SessionSidebar />}
    </Sidebar>
  )
}
