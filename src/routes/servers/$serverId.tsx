import { createFileRoute } from '@tanstack/react-router'
import { Server } from 'lucide-react'
import { useServers } from '@/lib/servers/hooks'
import { SessionList } from '@/components/sessions/session-list'
import { ServerContext } from '@/hooks/context/server-context'
import { useContext, useEffect } from 'react'

export const Route = createFileRoute('/servers/$serverId')({
  component: ServerLayout,
})

function ServerLayout() {
  const { serverId } = Route.useParams()
  const { setSelectedServer, selectedServer, servers } = useContext(ServerContext)

  useEffect(() => {
    const server = servers?.find((s) => s.identifier === parseInt(serverId))
    setSelectedServer && setSelectedServer(server)
  }, [serverId, servers])

  if (!selectedServer) {
    return undefined
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Server className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">{selectedServer.name}</h1>
            <p className="text-muted-foreground">{selectedServer.url}</p>
          </div>
        </div>
      </div>
      <SessionList server={selectedServer} />
    </div>
  )
}
