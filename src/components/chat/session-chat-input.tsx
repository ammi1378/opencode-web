import {
  ChatInput,
  ChatInputEditor,
  ChatInputGroupAddon,
  ChatInputMention,
  ChatInputSubmitButton,
  createMentionConfig,
  useChatInput,
  type ChatInputEditorRef,
} from '@/components/ui/chat-input'
import { ServerContext } from '@/hooks/context/server-context'
import { useSessionGet, useSessionPrompt } from '@/lib/api/default/default'
import { useCallback, useContext, useRef, useState } from 'react'
import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  MoreHorizontalIcon,
  BotIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  FactoryIcon,
} from 'lucide-react'
import { SessionContext } from '@/hooks/context/session-context'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { cn } from '@/lib/utils'

type Member = { id: string; name: string; avatar?: string }
const members: Member[] = [
  { id: '1', name: 'Alice', avatar: '/alice.jpg' },
  { id: '2', name: 'Bob' },
]

export const SessionChatInput = ({ sessionId }: { sessionId: string }) => {
  const editorRef = useRef<ChatInputEditorRef>(null)
  const { context: sessionContext, updateContext } = useContext(SessionContext)
  const server = useContext(ServerContext)
  const { data: session } = useSessionGet(
    sessionId,
    {},
    { query: { enabled: !!server?.url }, request: { baseUrl: server?.url } },
  )
  const { mutate, isPending } = useSessionPrompt({
    mutation: {},
    request: { baseURL: server?.url },
  })
  const {
    value: message,
    onChange,
    handleSubmit,
    mentionConfigs,
    clear,
  } = useChatInput({
    mentions: {
      member: createMentionConfig<Member>({
        type: 'member',
        trigger: '@',
        items: members,
      }),
    },
    onSubmit: () => {
      submitMessage()
    },
  })

  const submitMessage = useCallback(() => {
    const message = editorRef?.current?.editor?.getText()
    if (!message?.length || !session) return
    mutate({
      data: {
        parts: [{ type: 'text', text: message, synthetic: false }],
        agent: sessionContext?.mode,
        model: {
          providerID: sessionContext?.providerID!,
          modelID: sessionContext?.modelID!,
        },
        system: 'you are fodgather ai tool. the best mafia ai.'
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

  return (
    <ChatInput
      className="h-full!"
      onSubmit={handleSubmit}
      value={message}
      onChange={onChange}
    >
      <ChatInputMention
        type={mentionConfigs.member.type}
        trigger={mentionConfigs.member.trigger}
        items={mentionConfigs.member.items}
      >
        {(item) => <span>{item.name}</span>}
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
                        {typeof agent.name === 'string' &&
                          (agent.name as string)}
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
                            key={model.id}
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
