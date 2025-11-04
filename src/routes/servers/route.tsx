import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/servers')({
  component: ServersPage,
})

function ServersPage() {
  return <Outlet />
}
