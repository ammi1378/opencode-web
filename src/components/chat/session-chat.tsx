import { MessageSquare } from 'lucide-react'
import { useCallback, useContext, useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { SessionChatMessage } from './session-chat-message'
import type { Server } from '@/lib/servers/types'
import type {ISessionContext} from '@/hooks/context/session-context';
import { useSessionGet, useSessionMessages } from '@/lib/api/default/default'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ServerContext } from '@/hooks/context/server-context'
import {
  
  SessionContext
} from '@/hooks/context/session-context'

interface SessionChatProps {
  sessionId?: string
  server: Server | undefined
  defaultOpen?: boolean
  hideAccordionUi?: boolean
}

export function SessionChat({
  sessionId,
  defaultOpen,
  hideAccordionUi,
}: SessionChatProps) {
  const { selectedServer: server } = useContext(ServerContext)
  const { context: sessionContext, updateContext } = useContext(SessionContext)
  const { data: session } = useSessionGet(
    sessionId!,
    {},
    {
      query: { enabled: !!server?.url && !!sessionId?.length },
      request: { baseUrl: server?.url },
    },
  )
  const {
    data: messages,
    isLoading,
    error,
  } = useSessionMessages(
    sessionId!,
    {},
    {
      query: {
        enabled: !!server?.url && !!sessionId?.length,
        refetchOnWindowFocus: false,
      },
      request: { baseUrl: server?.url },
    },
  )

  const localUpdateContext = useCallback(
    (v: ISessionContext['context']) => {
      if (
        sessionContext?.mode !== v?.mode ||
        sessionContext?.modelID !== v?.modelID ||
        sessionContext?.providerID !== v?.providerID
      ) {
        updateContext(v)
      }
    },
    [sessionContext],
  )

  useEffect(() => {
    const lastMessage = messages?.at(-1)
    if (lastMessage?.info.role === 'user') return
    let localContext: ISessionContext['context'] = {}
    messages?.slice(-4)?.forEach((message) => {
      if (message.info.role === 'assistant') {
        if (
          localContext?.mode !== message.info?.mode ||
          localContext?.modelID !== message.info?.modelID ||
          localContext?.providerID !== message.info?.providerID
        ) {
          localContext = {
            mode: message.info?.mode,
            modelID: message.info?.modelID,
            providerID: message.info?.providerID,
          }
        }
      }
    })

    localUpdateContext(localContext)
  }, [messages])

  const [openSession, setOpenSession] = useState<string>()

  if (!session || !messages) {
    return
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return
  }
  return (
    <Accordion
      type="single"
      collapsible
      value={defaultOpen || hideAccordionUi ? session?.id : openSession}
      onValueChange={setOpenSession}
    >
      <AccordionItem value={session.id}>
        <AccordionTrigger className={cn(hideAccordionUi && 'sr-only')}>
          {session.title}
        </AccordionTrigger>
        <AccordionContent className="">
          {error ? (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Error Loading Messages
                </CardTitle>
                {/* <CardDescription>{error.data as any}</CardDescription> */}
              </CardHeader>
            </Card>
          ) : !messages || messages.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle>No Messages Found</CardTitle>
                <CardDescription>
                  There are no messages available for this session.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                return (
                  <SessionChatMessage
                    server={server}
                    message={message}
                    key={message.info.id}
                  />
                )
              })}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
