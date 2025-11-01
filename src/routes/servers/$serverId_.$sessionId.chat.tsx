import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useServers } from '@/lib/servers/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionChat } from '@/components/chat/session-chat'
import { ServerContext } from '@/hooks/context/server-context'
import { useSSEStream } from '@/hooks/use-event-subscibe'
import { SessionChatInput } from '@/components/chat/session-chat-input'
import {
  SessionContext,
  type IProviderContext,
  type ISessionContext,
} from '@/hooks/context/session-context'
import { useMemo, useState } from 'react'
import {
  useAppAgents,
  useConfigGet,
  useConfigProviders,
} from '@/lib/api/default/default'
import type { Agent} from '@/lib/api/model'

export const Route = createFileRoute('/servers/$serverId_/$sessionId/chat')({
  component: SessionChatPage,
})

function SessionChatPage() {
  const { serverId, sessionId } = Route.useParams()
  const { servers, isLoading: serversLoading } = useServers()
  const server = servers.find((s) => s.identifier === parseInt(serverId))
  useSSEStream({
    endpoint: `${server?.url}/event?directory=${'/Users/ammi1378/Documents/Personal/opencode-ui'}`,
    queryKey: ['activity-log'],
    maxItems: 100,
    enabled: !!server,
    directory: '/Users/ammi1378/Documents/Personal/opencode-ui',
  })
  const { data: config } = useConfigGet(
    {},
    { query: { enabled: !!server?.url }, request: { baseUrl: server?.url } },
  )
  const { data: providersData } = useConfigProviders(
    {},
    { query: { enabled: !!server?.url }, request: { baseUrl: server?.url } },
  )

  const { data: agents } = useAppAgents(
    {},
    { query: { enabled: !!server?.url }, request: { baseUrl: server?.url } },
  )

  const [sessionContext, setSessionContext] =
    useState<ISessionContext['context']>()

  const agentsConfig = useMemo(() => {
    const initialValue: {
      primaryAgents: Agent[]
      subAgents: Agent[]
    } = {
      primaryAgents: [],
      subAgents: [],
    }
    agents?.forEach((agent) => {
      if (agent.mode === 'primary') {
        initialValue.primaryAgents.push(agent)
      } else if (agent.mode === 'subagent') {
        initialValue.subAgents.push(agent)
      } else if (agent.mode === 'all' || !agent.mode) {
        initialValue.primaryAgents.push(agent)
        initialValue.subAgents.push(agent)
      }
    })
    return initialValue
  }, [agents])

  const providersConfig = useMemo(() => {
    const providers = providersData?.providers?.map(
      (provider): IProviderContext => {
        provider.models
        const models = Object.keys(provider.models).map(
          (key) => provider.models[key],
        )
        return {
          ...provider,
          models,
        }
      },
    )

    return providers
  }, [providersData])

  if (serversLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
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
      </div>
    )
  }

  if (!server) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Server Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The server with identifier {serverId} could not be found.
        </p>
        <Link to="/servers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Servers
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <ServerContext value={server}>
      <SessionContext
        value={{
          context: {
            config,
            agentsConfig: agentsConfig,
            providers: providersConfig,
            ...sessionContext,
          },
          updateContext: (context) =>
            setSessionContext({ ...sessionContext, ...context }),
        }}
      >
        <div className="flex flex-col h-full overflow-hidden space-y-2">
          <div className="overflow-hidden grow relative">
            <div className="overflow-auto h-full [scrollbar-gutter:stable_both-edges] pb-20">
              <div className="container mx-auto relative s">
                <div className="flex items-center justify-between sticky top-0 bg-white py-3 border-b mb-2 z-10">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/servers/$serverId/sessions"
                      params={{ serverId }}
                    >
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sessions
                      </Button>
                    </Link>
                    <div>
                      <h2 className="text-2xl font-bold">Session Chat</h2>
                      <p className="text-muted-foreground">
                        Viewing messages for session {sessionId} on{' '}
                        {server.name}
                      </p>
                    </div>
                  </div>
                </div>
                <SessionChat
                  server={server}
                  sessionId={sessionId}
                  hideAccordionUi
                />
              </div>
              <div className="bg-linear-to-t from-white to-transparent h-8 absolute bottom-0 w-full"></div>
            </div>
          </div>

          <div className="container mx-auto min-h-48">
            <SessionChatInput sessionId={sessionId} />
          </div>
        </div>
      </SessionContext>
    </ServerContext>
  )
}
