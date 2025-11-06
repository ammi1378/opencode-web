import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SessionList } from '@/components/sessions/session-list'

export const Route = createFileRoute('/sessions')({
  component: ServerSessionsPage,
})

function ServerSessionsPage() {
  return (
    <div className="space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sessions</h2>
          <p className="text-muted-foreground">Manage and view chat sessions</p>
        </div>
        <Button
          variant="outline"
          // onClick={() => refetch()}
          // disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4`} />
          Refresh
        </Button>
      </div>

      <SessionList />
    </div>
  )
}
