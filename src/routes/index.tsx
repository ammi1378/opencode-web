import { createFileRoute } from '@tanstack/react-router'
import { SessionList } from '@/components/sessions/session-list'

export const Route = createFileRoute('/')({
  component: ServerLayout,
})

function ServerLayout() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div></div>
        </div>
      </div>
      <SessionList />
    </div>
  )
}
