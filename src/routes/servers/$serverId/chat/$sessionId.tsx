import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import type { Agent } from '@/lib/api/model'
import type {
  IProviderContext,
  ISessionContext,
} from '@/hooks/context/session-context'
import { Button } from '@/components/ui/button'
import { SessionChat } from '@/components/chat/session-chat'
import { ServerContext } from '@/hooks/context/server-context'
import { useSSEStream } from '@/hooks/use-event-subscibe'
import { SessionChatInput } from '@/components/chat/session-chat-input'
import { SessionContext } from '@/hooks/context/session-context'
import {
  useAppAgents,
  useConfigGet,
  useConfigProviders,
} from '@/lib/api/default/default'

export const Route = createFileRoute('/servers/$serverId/chat/$sessionId')({
  component: SessionChatPage,
})

function SessionChatPage() {
  const { serverId, sessionId } = Route.useParams()
  const {
    selectedServer: server,
    servers,
    setSelectedServer,
  } = useContext(ServerContext)
  useEffect(() => {
    const localServer = servers?.find(
      (s) => s.identifier === parseInt(serverId),
    )
    setSelectedServer && setSelectedServer(localServer)
  }, [serverId, servers])

  useSSEStream({
    endpoint: `${server?.url}/event`,
    queryKey: ['activity-log'],
    maxItems: 100,
    enabled: !!server,
    // directory: '/Users/ammi1378/Documents/Personal/opencode-ui',
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
      primaryAgents: Array<Agent>
      subAgents: Array<Agent>
    } = {
      primaryAgents: [],
      subAgents: [],
    }
    agents?.forEach((agent) => {
      if (agent.mode === 'primary') {
        initialValue.primaryAgents.push(agent)
      } else if (agent.mode === 'subagent') {
        initialValue.subAgents.push(agent)
      } else {
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
          <SessionChat server={server} sessionId={sessionId} hideAccordionUi />
        </div>

        <div className="container mx-auto min-h-48">
          <SessionChatInput sessionId={sessionId} />
        </div>
      </div>
    </SessionContext>
  )
}
