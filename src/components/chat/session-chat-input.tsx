import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  BotIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FactoryIcon,
  Info,
  MoreHorizontalIcon,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import type { ChatInputEditorRef } from '@/components/ui/chat-input'
import {
  ChatInput,
  ChatInputEditor,
  ChatInputGroupAddon,
  ChatInputMention,
  ChatInputSubmitButton,
  createMentionConfig,
  useChatInput,
} from '@/components/ui/chat-input'
import {
  useSessionCreate,
  useSessionGet,
  useSessionPrompt,
} from '@/lib/api/default/default'
import { SessionContext } from '@/hooks/context/session-context'
import { cn } from '@/lib/utils'

type Mention = { id: string; name: string; description?: string }

export const SessionChatInput = ({ sessionId }: { sessionId?: string }) => {
  const editorRef = useRef<ChatInputEditorRef>(null)
  const { context: sessionContext, updateContext } = useContext(SessionContext)
  const { data: session } = useSessionGet(
    sessionId!,
    {},
    {
      query: { enabled: !!sessionId?.length },
    },
  )

  const navigate = useNavigate({ from: '/chat/new' })

  const { mutate, mutateAsync, isPending } = useSessionPrompt({
    mutation: {},
  })

  const subAgents = useMemo(() => {
    return sessionContext?.agentsConfig?.subAgents?.map((agent) => {
      return {
        id: agent.name,
        name: agent.name,
        description: agent.description,
      } satisfies Mention
    })
  }, [sessionContext])

  const commands = useMemo(() => {
    return sessionContext?.commands?.map((command) => {
      return {
        id: command.name,
        name: command.name,
        description: command.description,
      } satisfies Mention
    })
  }, [sessionContext])

  const {
    mutateAsync: mutateCreateSessionAsync,
    isPending: isCreateSessionPending,
  } = useSessionCreate({
    mutation: {},
  })
  const {
    value: message,
    onChange,
    handleSubmit,
    mentionConfigs,
    clear,
    parsed,
  } = useChatInput({
    mentions: {
      agents: createMentionConfig<Mention>({
        type: 'agents',
        trigger: '@',
        items: subAgents || [],
      }),
      commands: createMentionConfig<Mention>({
        type: 'commands',
        trigger: '/',
        items: commands || [],
      }),
    },
    onSubmit: () => {
      submitMessage()
    },
  })

  const createNewChat = useCallback(
    async (localMessage: string) => {
      const newSession = await mutateCreateSessionAsync({
        data: {},
      })

      await mutateAsync({
        data: {
          parts: [{ type: 'text', text: localMessage, synthetic: false }],
          agent: sessionContext?.mode,
          model: {
            providerID: sessionContext?.providerID!,
            modelID: sessionContext?.modelID!,
          },
        },
        id: newSession.id,
        // params: { directory: newSession.directory },
      })

      navigate({
        to: '/chat/$sessionId',
        params: {
          sessionId: newSession.id,
        },
      })
    },
    [mutateCreateSessionAsync, mutateAsync, sessionContext, navigate],
  )

  console.log({ parsed })

  const submitMessage = useCallback(() => {
    const message = editorRef?.current?.editor?.getText()

    if (message?.length && !session) {
      createNewChat(message)
    }
    if (!message?.length || !session) return
    mutate({
      data: {
        parts: [{ type: 'text', text: message, synthetic: false }],
        agent: sessionContext?.mode,
        model: {
          providerID: sessionContext?.providerID!,
          modelID: sessionContext?.modelID!,
        },
      },
      id: session.id,
      params: { directory: session.directory },
    })
    clear()
  }, [session, clear, sessionContext])

  const [open, setOpen] = useState(false)
  const selectedModel = sessionContext?.providers
    ?.find((p) => p.id === sessionContext.providerID)
    ?.models?.find((m) => m.id === sessionContext.modelID)

  console.log({
    cond: parsed.content.length < 2,
  })

  return (
    <ChatInput
      className="h-full!"
      onSubmit={handleSubmit}
      value={message}
      onChange={onChange}
    >
      <ChatInputMention
        type={mentionConfigs.agents.type}
        trigger={mentionConfigs.agents.trigger}
        items={mentionConfigs.agents.items}
      >
        {(item) => {
          return (
            <span
              key={`agent:${item.name}`}
              className="flex justify-between gap-x-2 w-full"
            >
              {item.name}
              {item.description && (
                <Tooltip>
                  <TooltipTrigger className="text-start">
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-200 max-w-xs">
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          )
        }}
      </ChatInputMention>
      <ChatInputMention
        type={mentionConfigs.commands.type}
        trigger={mentionConfigs.commands.trigger}
        items={mentionConfigs.commands.items}
      >
        {(item) => {
          return (
            <span
              key={`command:${item.name}`}
              className="flex justify-between gap-x-2 w-full"
            >
              {item.name}
              {item.description && (
                <Tooltip>
                  <TooltipTrigger className="text-start">
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="z-200 max-w-xs">
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              )}
            </span>
          )
        }}
      </ChatInputMention>

      <ChatInputEditor ref={editorRef} placeholder="Type @ to mention..." />
      <ChatInputGroupAddon align="block-end">
        <ButtonGroup>
          <Button variant="outline">
            <BotIcon />
            {sessionContext?.mode ?? 'UNKNOWN'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuRadioGroup
                value={sessionContext?.mode}
                onValueChange={(value) => {
                  const agent =
                    sessionContext?.agentsConfig?.primaryAgents.find(
                      (i) => i.name === value,
                    )
                  if (agent) {
                    updateContext({
                      mode: agent.name,
                      ...(agent.model?.modelID?.length
                        ? { modelID: agent.model?.modelID }
                        : ''),
                      ...(agent.model?.providerID?.length
                        ? { providerID: agent.model?.providerID }
                        : ''),
                    })
                  }
                }}
              >
                {sessionContext?.agentsConfig?.primaryAgents
                  ?.filter((agent) => agent.name !== sessionContext.mode)
                  .map((agent) => {
                    return (
                      <DropdownMenuRadioItem value={agent.name}>
                        {typeof agent.name === 'string' && agent.name}
                      </DropdownMenuRadioItem>
                    )
                  })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[200px] justify-between"
            >
              <div className="flex items-center flex-row space-x-2">
                <FactoryIcon />
                <span>
                  {selectedModel ? selectedModel?.name : 'Select framework...'}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                {sessionContext?.providers?.map((provider) => {
                  return (
                    <CommandGroup key={provider.id} heading={provider.id}>
                      {provider.models.map((model) => {
                        return (
                          <CommandItem
                            value={`${provider.id}-${model.id}`}
                            key={`${provider.id}-${model.id}`}
                            onSelect={() => {
                              updateContext({
                                providerID: provider.id,
                                modelID: model.id,
                              })
                              setOpen(false)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                sessionContext?.providerID === provider.id &&
                                  sessionContext?.modelID === model.id
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {model.name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  )
                })}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <ChatInputSubmitButton
          className="ml-auto"
          onClick={submitMessage}
          disabled={isPending}
        />
      </ChatInputGroupAddon>
    </ChatInput>
  )
}
