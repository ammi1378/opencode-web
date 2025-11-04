import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SessionList } from '@/components/sessions/session-list'
import { ServerContext } from '@/hooks/context/server-context'

export const Route = createFileRoute('/servers/$serverId/sessions')({
  component: ServerSessionsPage,
})

function ServerSessionsPage() {
  const { serverId } = Route.useParams()
  const { setSelectedServer, selectedServer, servers } =
    useContext(ServerContext)

  useEffect(() => {
    const server = servers?.find((s) => s.identifier === parseInt(serverId))
    setSelectedServer && setSelectedServer(server)
  }, [serverId, servers])

  if (!selectedServer) {
    return undefined
  }


  return (
    <div className="space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sessions</h2>
          <p className="text-muted-foreground">
            Manage and view chat sessions for {selectedServer.name}
          </p>
        </div>
        <Button
          variant="outline"
          // onClick={() => refetch()}
          // disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${false ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      <SessionList server={selectedServer} />
    </div>
  )
}
