import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Server } from 'lucide-react'
import { useServers } from '@/lib/servers/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav'

export const Route = createFileRoute('/servers/$serverId')({
  component: ServerLayout,
})

function ServerLayout() {
  const { serverId } = Route.useParams()
  const { servers, isLoading } = useServers()

  const server = servers.find((s) => s.identifier === parseInt(serverId))

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Server Not Found</h1>
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
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <BreadcrumbNav />
      </div>

      <div className="mb-8">
        <Link to="/servers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Servers
          </Button>
        </Link>

        <div className="flex items-center space-x-4">
          <Server className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">{server.name}</h1>
            <p className="text-muted-foreground">{server.url}</p>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  )
}
