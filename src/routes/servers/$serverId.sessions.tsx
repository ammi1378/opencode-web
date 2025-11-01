import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useServers } from '@/lib/servers/hooks'
import { Button } from '@/components/ui/button'
import { SessionList } from '@/components/sessions/session-list'
import { useSessionList } from '@/lib/api/default/default'

export const Route = createFileRoute('/servers/$serverId/sessions')({
  component: ServerSessionsPage,
})

function ServerSessionsPage() {
  const { serverId } = Route.useParams()
  const { servers, isLoading: serversLoading } = useServers()

  const server = servers.find((s) => s.identifier === parseInt(serverId))

  const {
    data: sessions,
    isLoading,
    error,
    refetch,
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

  if (serversLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <SessionList sessions={[]} isLoading={true} />
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
      </div>
    )
  }

  return (
    <div className="space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sessions</h2>
          <p className="text-muted-foreground">
            Manage and view chat sessions for {server.name}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <SessionList
        sessions={sessions || []}
        isLoading={isLoading}
        error={(error as any)?.message}
        serverId={serverId}
      />
    </div>
  )
}
