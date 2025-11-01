import type { Server } from '@/lib/servers/types'
import { MessageSquare } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SessionMessage200 } from '@/lib/api/model'
import { SessionChatMessagePart } from './session-chat-message-part'

interface SessionChatMessageProps {
  message: SessionMessage200
  server: Server | undefined
}

export function SessionChatMessage({ message }: SessionChatMessageProps) {
  if (!message.parts?.length) {
    return undefined
  }
  return (
    <Card className="">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-muted-foreground" />
            {message.info.role}
          </CardTitle>
          {message.info.time.created && (
            <CardDescription>
              {new Date(message.info.time.created).toLocaleString()}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {message.parts.map((part, index) => {
          return (
            <SessionChatMessagePart index={index} part={part} key={part.id} />
          )
        })}
      </CardContent>
      {/* {index < messages.length - 1 && <Separator className="mt-4" />} */}
    </Card>
  )
}
