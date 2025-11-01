import { Plus, Server } from 'lucide-react'
import { ServerCard } from './server-card'
import type { Server as ServerType } from '@/lib/servers/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ServersListProps {
  servers: Array<ServerType>
  onEdit: (server: ServerType) => void
  onDelete: (serverId: string) => void
  onAddServer: () => void
  isLoading?: boolean
}

export function ServersList({
  servers,
  onEdit,
  onDelete,
  onAddServer,
  isLoading = false,
}: ServersListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (servers.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Server className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>No servers configured</CardTitle>
          <CardDescription>
            Get started by adding your first OpenCode server configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onAddServer} className="mx-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Servers</h2>
        <Button onClick={onAddServer}>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
