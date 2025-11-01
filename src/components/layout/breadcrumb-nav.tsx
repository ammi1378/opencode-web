import { Link, useMatches } from '@tanstack/react-router'
import { useServers } from '@/lib/servers/hooks'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function BreadcrumbNav() {
  const matches = useMatches()
  const { servers } = useServers()
  const pathname = window.location.pathname

  // CRITICAL: Handle flat route pattern for chat routes
  const isChatRoute = pathname.match(/^\/servers\/([^/]+)\/([^/]+)\/chat$/)

  if (isChatRoute) {
    const [, serverId] = isChatRoute
    const server = servers.find((s) => s.identifier === parseInt(serverId))

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/">
              <BreadcrumbLink>Home</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/servers">
              <BreadcrumbLink>Servers</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          {server && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link to="/servers/$serverId" params={{ serverId }}>
                  <BreadcrumbLink>{server.name}</BreadcrumbLink>
                </Link>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/servers/$serverId/sessions" params={{ serverId }}>
              <BreadcrumbLink>Sessions</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Chat</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const getPageTitle = (currentPathname: string, routeId: string): string => {
    if (routeId === '/demo/tanstack-query') return 'TanStack Query Demo'
    if (routeId === '/about') return 'About'
    if (routeId === '/servers') return 'Servers'
    if (routeId === '/servers/$serverId') {
      const serverIdMatch = currentPathname.match(/\/servers\/(\d+)/)
      if (serverIdMatch) {
        const serverId = parseInt(serverIdMatch[1])
        const server = servers.find((s) => s.identifier === serverId)
        return server?.name || 'Server'
      }
      return 'Server'
    }
    if (routeId === '/servers/$serverId/sessions') return 'Sessions'

    const segments = currentPathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (!lastSegment) return 'Page'

    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  const getBreadcrumbLink = (
    currentPathname: string,
    routeId: string,
  ): string => {
    if (routeId === '/servers/$serverId') {
      const serverIdMatch = currentPathname.match(/\/servers\/(\d+)/)
      if (serverIdMatch) {
        return `/servers/${serverIdMatch[1]}`
      }
    }
    return currentPathname
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/">
            <BreadcrumbLink>Home</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>

        {matches
          .filter(
            (match) => match.pathname !== '/' && match.routeId !== '__root__',
          )
          .map((match, index, array) => (
            <BreadcrumbItem key={match.id}>
              {index === array.length - 1 ? (
                <BreadcrumbPage>
                  {getPageTitle(match.pathname, match.routeId)}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbSeparator />
                  <Link to={getBreadcrumbLink(match.pathname, match.routeId)}>
                    <BreadcrumbLink>
                      {getPageTitle(match.pathname, match.routeId)}
                    </BreadcrumbLink>
                  </Link>
                </>
              )}
            </BreadcrumbItem>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
