# Implementation Plan: Session Chat Read-Only Route

## Review Fixes Applied (per feedback)

- Hook approach: implement a true stub now with a clear TODO to replace with real SDK call later (no live SDK call in the stub).
- Timestamps: normalize to milliseconds at ingestion across all components. If the SDK returns seconds, convert once on ingestion and store/use ms everywhere.
- Navigation placement: add chat navigation in the sessions route file (src/routes/servers/$serverId\_.sessions.tsx), not inside the SessionList component.
- Breadcrumbs: explicitly update BreadcrumbNav to handle the flat chat route; do not render in-route breadcrumbs.
- Types organization: place shared message types in src/lib/opencode/types.ts and import where needed.
- SessionList consistency: update components/sessions/session-list.tsx to assume ms timestamps and remove any per-render conversions.

## Implementation Overview

- Goal: Add a read-only chat view for session messages at /servers/:serverId/:sessionId/chat.
- Route file: src/routes/servers/$serverId_.$sessionId.chat.tsx (flat pattern with underscore after $serverId\_ as per IMPORTANT route decision).
- Data: Fetch session messages via a React Query-based hook (stubbed initially) that returns mocked data; TODO: replace stub with OpenCode SDK client.session.messages(sessionId).
- UI: ShadCN components (Card, Separator, Skeleton) for consistent layout/feedback; no input/send controls.
- Nav: Link into chat view from the Sessions page; breadcrumb updates consistent with existing BreadcrumbNav.
- Errors: Validate params and server existence; surface network/API errors with retry; handle empty states.
- Adhere to IMPORTANT guidelines: route structure, React Query strategy, SDK client pattern, UI consistency.

## Component Details (with code structure examples)

### Route component (src/routes/servers/$serverId_.$sessionId.chat.tsx)

- Responsibility: Resolve params, validate server, invoke useSessionMessages, render header + message list + loading/error states; read-only only.

Example structure (illustrative only):

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useServers } from '@/lib/servers/hooks'
import { useSessionMessages } from '@/lib/opencode/hooks' // stub hook for now
import type { SessionMessage } from '@/lib/opencode/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/servers/$serverId_/$sessionId/chat')({
  component: SessionChatRoute,
})

function SessionChatRoute() {
  const { serverId, sessionId } = Route.useParams()
  const { servers, isLoading: serversLoading } = useServers()
  const server = servers.find((s) => s.identifier === parseInt(serverId))

  if (serversLoading) {
    return <PageSkeleton />
  }

  if (!server) {
    return (
      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Server Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            The server with identifier {serverId} could not be found.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { messages, isLoading, error, refetch } = useSessionMessages(
    server,
    sessionId,
  )

  if (error) {
    return <ErrorCard message={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <Header
        serverName={server.name}
        serverId={serverId}
        sessionId={sessionId}
      />
      {isLoading ? (
        <MessageListSkeleton />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} />
      )}
    </div>
  )
}

function Header({
  serverName,
  serverId,
  sessionId,
}: {
  serverName: string
  serverId: string
  sessionId: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold">Chat</h2>
      <p className="text-muted-foreground">Viewing messages for {serverName}</p>
      {/* Breadcrumbs are handled globally via BreadcrumbNav; do not embed here. */}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <MessageListSkeleton />
    </div>
  )
}
```

### Message list and items (in-route lightweight components or extracted later)

```tsx
import type { SessionMessage, MessagePart } from '@/lib/opencode/types'

function MessageList({ messages }: { messages: SessionMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <MessageCard key={m.info.id} message={m} />
      ))}
    </div>
  )
}

function MessageCard({ message }: { message: SessionMessage }) {
  const { info, parts } = message
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted mr-2">
            {info.role}
          </span>
          <span className="text-muted-foreground">
            {new Date(info.time.created).toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {parts.map((p) => (
          <div key={p.id}>
            <MessagePartView part={p} />
            <Separator className="my-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MessagePartView({ part }: { part: MessagePart }) {
  if (part.type === 'text')
    return <p className="whitespace-pre-wrap">{part.text}</p>
  if (part.type === 'code')
    return (
      <pre className="bg-muted rounded p-3 overflow-auto text-sm">
        <code>{part.code}</code>
      </pre>
    )
  // Fallback
  return <p className="text-muted-foreground">Unsupported part</p>
}

function MessageListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-destructive">{message}</p>
        {onRetry && (
          <button className="underline text-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No messages yet</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        This session has no messages.
      </CardContent>
    </Card>
  )
}
```

Notes:

- All UI uses ShadCN primitives for consistency (IMPORTANT: UI Consistency).
- Keep components inline initially; extract to src/components/chat/\* if we grow features.

## Data Structures (TypeScript interfaces)

Place these in a central module: src/lib/opencode/types.ts (shared across hooks/components). All timestamps are milliseconds since epoch.

```ts
export type Role = 'user' | 'assistant' | 'system' | 'tool'

export interface MessageInfo {
  id: string
  role: Role
  // Timestamps in milliseconds since epoch
  time: { created: number; updated?: number }
  // Optional metadata present in SDK responses
  title?: string
  parentID?: string
}

export type MessagePart =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'code'; language?: string; code: string }
  | { id: string; type: 'other'; payload: unknown }

export interface SessionMessage {
  info: MessageInfo
  parts: MessagePart[]
}
```

Return types for the hook:

```ts
export interface UseSessionMessagesResult {
  messages: SessionMessage[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}
```

## Timestamp Standardization

- Standard unit: milliseconds since epoch.
- Normalize at ingestion: if the SDK returns seconds, convert once on ingestion (e.g., `createdMs = createdSec * 1000`), then store/use ms everywhere.
- Apply consistently across chat messages and existing SessionList items; remove any per-render conversions.

## API Design (React Query hooks)

IMPORTANT: Data Fetching Strategy — use React Query for caching/loading/error states. The app already mounts TanStack Query provider (integrations/tanstack-query/root-provider.tsx), so use useQuery.

Hook signature and behavior:

- useSessionMessages(server: Server | null, sessionId: string): UseSessionMessagesResult
- Enables only when server && sessionId are truthy.
- Query key: ['servers', server?.identifier, 'sessions', sessionId, 'messages']
- Fetcher: STUB FOR NOW — return mocked data after a short delay; TODO replace with createOpencodeClient(server.url).session.messages(sessionId) and map to SessionMessage[] with ms timestamps.
- Caching: staleTime 30s, gcTime 5m; retry 2; refetchOnWindowFocus: false.
- Error mapping: convert to string for UI surfaces.

Illustrative code (place in src/lib/opencode/hooks.ts alongside useServerSessions):

```ts
import { useQuery } from '@tanstack/react-query'
import type { Server } from '@/lib/servers/types'
import type {
  SessionMessage,
  UseSessionMessagesResult,
} from '@/lib/opencode/types'

export function useSessionMessages(
  server: Server | null,
  sessionId: string,
): UseSessionMessagesResult {
  const enabled = Boolean(server && sessionId)

  const query = useQuery<SessionMessage[], Error>({
    queryKey: [
      'servers',
      server?.identifier,
      'sessions',
      sessionId,
      'messages',
    ],
    enabled,
    staleTime: 30_000,
    gcTime: 300_000,
    retry: 2,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // STUB: simulate network and return mocked messages
      // TODO(opencode): Replace with real SDK call using createOpencodeClient(server!.url).session.messages(sessionId)
      // Ensure timestamps are converted to ms when integrating.
      await new Promise((r) => setTimeout(r, 200))
      return [] as SessionMessage[]
    },
  })

  return {
    messages: query.data ?? [],
    isLoading: query.isFetching || query.isLoading,
    error: query.error
      ? query.error.message || 'Failed to fetch messages'
      : null,
    refetch: () => query.refetch(),
  }
}
```

Notes:

- Keep naming consistent with useServerSessions for DX.
- When switching from stub to SDK, adapt mapping in queryFn while preserving SessionMessage[] contract and ms timestamps.

## Integration with Existing Sessions Page

- Location: src/routes/servers/$serverId\_.sessions.tsx and components/sessions/session-list.tsx
- Implement navigation to Chat page in the sessions route file (NOT inside SessionList). The route has access to serverId via Route.useParams.
- Update SessionList to assume ms timestamps for any displayed times and remove inline multiplications; rely on normalized ms data from data layer.

Example (illustrative):

```tsx
// src/routes/servers/$serverId_.sessions.tsx
import { Link } from '@tanstack/react-router'

function SessionsRoute() {
  const { serverId } = Route.useParams()
  // ... obtain sessions array
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between">
          {/* existing SessionList or item content here */}
          <Link
            to={`/servers/${serverId}/${session.id}/chat`}
            className="text-sm underline"
          >
            View chat
          </Link>
        </div>
      ))}
    </div>
  )
}
```

- If SessionList renders items internally, pass the serverId and/or a render prop for the action area from the route file rather than constructing links inside SessionList.

## Error Handling Patterns

- Param validation: parseInt(serverId) and ensure a matching server exists; if not, render a Server Not Found card (pattern matches sessions page).
- Query errors: render ErrorCard with retry calling refetch from useSessionMessages.
- Empty state: render EmptyState card when messages.length === 0.
- Defensive checks: if sessionId is falsy, show a parameter error card rather than calling the API.
- Security: Do not render any input controls; read-only presentation only.

## Testing Strategy

Levels:

- Unit (hook):
  - With stub: assert query key composition, enabled gating, and loading/error mapping. When integrating SDK later, mock client.session.messages to return data/empty/error and ensure seconds→ms conversion.
- Component (route):
  - Render with MemoryRouter and mocked matches for /servers/123/abc/chat.
  - Mock useServers to return loading, not-found, and valid server cases.
  - Assert Skeleton while serversLoading, Not Found when server missing, and list rendering when data present.
  - Assert ErrorCard and retry invokes refetch.
- Integration (navigation):
  - In sessions route, clicking "View chat" navigates to chat route; breadcrumb shows Servers / <ServerName> / Chat.
- Visual/UX:
  - Verify ShadCN components render as expected.

Test data examples (ms timestamps):

- messages: [ { info: { id: 'm1', role: 'user', time: { created: 1700000000000 } }, parts: [{ id: 'p1', type: 'text', text: 'Hello' }] } ]

## Development Phases (step-by-step)

Phase 1 — Route & Layout (IMPORTANT: Route Structure)

1. Create src/routes/servers/$serverId_.$sessionId.chat.tsx with header, skeletons, and placeholders.
2. Implement param extraction and server validation mirroring sessions page.
3. Add read-only layout using Card/Separator/Skeleton components; no inputs.

Phase 2 — Data Layer (IMPORTANT: React Query + Stub First) 4. Add useSessionMessages to src/lib/opencode/hooks.ts using React Query (stubbed fetcher that returns [] and simulates latency). Add a clear TODO to integrate SDK. 5. Define SessionMessage, MessageInfo, MessagePart types in src/lib/opencode/types.ts and import them where needed. Enforce ms timestamps. 6. Wire the hook into the route; display loading/error/empty states.

Phase 3 — Navigation & Breadcrumbs (IMPORTANT: REQUIRED BreadcrumbNav Update) 7. Update BreadcrumbNav to explicitly detect the flat chat route `/servers/:serverId/:sessionId/chat` and resolve the server name using useServers, as outlined in the architectural analysis. Commit this change as a dedicated update. 8. Update the sessions route file to include a Link to `/servers/:serverId/:sessionId/chat` per item. Do not add links inside SessionList. 9. Ensure the chat route header contains only title/description; remove any in-route breadcrumb markup and rely on BreadcrumbNav.

Phase 4 — Polishing & Testing 9. Add message part renderers for text and code; provide safe fallbacks for unknown types. 10. Write unit tests for useSessionMessages hook (stubbed now; later with SDK mock) and route component behaviors. 11. Manual QA: fast refresh, navigation from sessions, empty/error/loading cases.

## Additional Notes

- Performance: consider virtualization for very long lists later; set conservative staleTime/gcTime now.
- Accessibility: ensure semantic elements and readable contrast in muted text/code blocks.
- Future: live updates or pagination can extend the hook (e.g., infiniteQuery).
- Consistency: follow naming and patterns from useServerSessions; keep props small and cohesive.
