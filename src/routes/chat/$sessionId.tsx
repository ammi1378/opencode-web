import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { Agent } from '@/lib/api/model'
import type {
  IProviderContext,
  ISessionContext,
} from '@/hooks/context/session-context'
import { SessionChat } from '@/components/chat/session-chat'
import { useSSEStream } from '@/hooks/use-event-subscibe'
import { SessionChatInput } from '@/components/chat/session-chat-input'
import { SessionContext } from '@/hooks/context/session-context'
import {
  useAppAgents,
  useConfigGet,
  useConfigProviders,
} from '@/lib/api/default/default'

export const Route = createFileRoute('/chat/$sessionId')({
  component: SessionChatPage,
})

function SessionChatPage() {
  const { sessionId } = Route.useParams()
  

  const { data: config } = useConfigGet({})
  const { data: providersData } = useConfigProviders({})

  const { data: agents } = useAppAgents({})

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

  const commandsConfig = useMemo(() => {
    if (!config?.command) {
      return []
    }
    const commands = Object.keys(config.command).map((command) => {
      return { ...config.command![command], name: command }
    })

    return commands
  }, [config])

  return (
    <SessionContext
      value={{
        context: {
          config,
          agentsConfig: agentsConfig,
          providers: providersConfig,
          commands: commandsConfig,
          ...sessionContext,
        },
        updateContext: (context) =>
          setSessionContext({ ...sessionContext, ...context }),
      }}
    >
      <div className="flex flex-col h-full overflow-hidden space-y-2">
        <div className="overflow-hidden grow relative">
          <SessionChat sessionId={sessionId} hideAccordionUi />
        </div>

        <div className="container mx-auto min-h-48">
          <SessionChatInput sessionId={sessionId} />
        </div>
      </div>
    </SessionContext>
  )
}
