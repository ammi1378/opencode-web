import { Clock, ExternalLink, Folder, MessageSquare } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { Server } from '@/lib/servers/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSessionList } from '@/lib/api/default/default'

interface SessionListProps {
  server?: Server
}

export function SessionList({ server }: SessionListProps) {
  const {
    data: sessions,
    isLoading,
    error,
  } = useSessionList(
    {},
    {
      query: {
        enabled: !!server?.url?.length,
      },
      request: {
        baseUrl: server?.url,
      },
    },
  )

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if ((error as any)?.message) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Error Loading Sessions
          </CardTitle>
          <CardDescription>{(error as any)?.message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (sessions?.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle>No Sessions Found</CardTitle>
          <CardDescription>
            There are no chat sessions available for this server.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  console.log({ sessions })

  return (
    <div className="grid gap-4">
      {sessions
        ?.filter((s) => !s.parentID?.length)
        .map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-muted-foreground" />
                    {session.title}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Created{' '}
                      {new Date(session.time.created).toLocaleDateString(
                        undefined,
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </span>
                    {session.time.updated !== session.time.created && (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Updated{' '}
                        {new Date(session.time.updated).toLocaleDateString(
                          undefined,
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {server && (
                    <Link
                      to="/servers/$serverId/$sessionId/chat"
                      params={{
                        serverId: server.identifier.toString(),
                        sessionId: session.id,
                      }}
                    >
                      <Button variant="outline" size="sm">
                        View Chat
                      </Button>
                    </Link>
                  )}
                  {session.share && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={session.share.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open shared session"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <Folder className="mr-1 h-3 w-3" />
                  <span className="font-medium">Directory:</span>{' '}
                  {session.directory}
                </div>
                <div>
                  <span className="font-medium">Session ID:</span> {session.id}
                </div>
                <div>
                  <span className="font-medium">Project ID:</span>{' '}
                  {session.projectID}
                </div>
                <div>
                  <span className="font-medium">Version:</span>{' '}
                  {session.version}
                </div>
                {session.parentID && (
                  <div>
                    <span className="font-medium">Parent Session:</span>{' '}
                    {session.parentID}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
