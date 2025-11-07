'use client'

import { useCallback } from 'react'
import { Plus } from 'lucide-react'

import { Link, useMatch, useNavigate } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { useSessionCreate, useSessionList } from '@/lib/api/default/default'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/integrations/zustand/session'
import { cn } from '@/lib/utils'

export function SessionSidebar({}: React.ComponentProps<typeof Sidebar>) {
  const { data: sessions } = useSessionList({})
  const navigate = useNavigate()
  const sessionsStatus = useSessionStore((state) => state.sessions)

  const { mutateAsync: mutateCreateSessionAsync } = useSessionCreate({
    mutation: {},
  })

  const sessionMatch = useMatch({
    from: '/chat/$sessionId',
    shouldThrow: false,
  })

  const createNewChat = useCallback(async () => {
    const newSession = await mutateCreateSessionAsync({
      data: {},
    })

    navigate({
      to: '/chat/$sessionId',
      params: {
        sessionId: newSession.id,
      },
    })
  }, [mutateCreateSessionAsync, navigate])
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className="w-full" onClick={createNewChat}>
              <Plus />
              New Chat
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions?.map((session) => {
                const isSessionActive =
                  sessionMatch?.params.sessionId === session.id
                return (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      className="h-auto"
                      asChild
                      isActive={isSessionActive}
                    >
                      <Link
                        to="/chat/$sessionId"
                        params={{
                          sessionId: session.id,
                        }}
                        key={session.id}
                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                      >
                        <div className="flex w-full items-start gap-2">
                          <span
                            className={cn(
                              'aspect-square size-0 transition-[width,height] rounded-full inline-block mt-1',
                              sessionsStatus[session.id]?.status ===
                                'updating' &&
                                !isSessionActive &&
                                'bg-sky-500 animate-ping size-1.5',
                              sessionsStatus[session.id]?.status === 'idle' &&
                                !isSessionActive &&
                                'bg-green-700 size-1.5',
                            )}
                          ></span>

                          <span className="whitespace-break-spaces">
                            {session.title}
                          </span>
                          <span className="ml-auto text-xs">
                            {new Date(
                              session.time.updated ?? session.time.created,
                            ).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <span className="font-medium">{session.directory}</span>
                        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                          {session.projectID}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
