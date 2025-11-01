# Architecture Analysis: Implement Server Sessions Page

## Context Analysis

The current application is a React-based server management interface built with TanStack Router, ShadCN UI components, and localStorage for persistence. The existing architecture includes:

- **TanStack Router**: File-based routing with type-safe navigation
- **Server Management**: CRUD operations for server configurations with UUID-based identification
- **UI Framework**: ShadCN components with consistent design patterns
- **Data Storage**: localStorage-based persistence with versioning and migration support
- **Component Architecture**: Modular components with clear separation of concerns

The task requires extending this architecture to support individual server session management using the OpenCode SDK, while introducing auto-incrementing server identifiers for better URL routing.

## Technology Recommendations

### TanStack Router Dynamic Routing

- **Pattern**: File-based routing with dynamic segments using `$serverId` parameter
- **Route Structure**: `/servers/$serverId/sessions` for individual server sessions
- **Type Safety**: Leverage TanStack Router's inferred types for route parameters
- **Navigation**: Breadcrumb navigation following TanStack Router patterns

### OpenCode SDK Integration

- **Library**: `@opencode-ai/sdk` (Context7-compatible: `/sst/opencode-sdk-js`)
- **Session Management**: Use `client.session.list()` and `client.session.messages()` APIs
- **Error Handling**: Implement proper API error handling with `Opencode.APIError`
- **Type Safety**: Leverage TypeScript definitions for `SessionListResponse` and related types

### Data Model Evolution

- **Server Identification**: Add auto-incrementing `identifier` field (starting from 0)
- **Migration Strategy**: Backward-compatible migration for existing servers
- **Session Storage**: Consider caching session data to reduce API calls

### ShadCN UI Components

- **Consistency**: Maintain existing component patterns (Cards, Buttons, Skeletons)
- **New Components**: Session list items, session status indicators, empty states
- **Responsive Design**: Follow existing grid and layout patterns

## System Architecture

### Data Model Changes

#### Enhanced Server Interface

```typescript
export interface Server {
  id: string // Existing UUID for internal identification
  identifier: number // NEW: Auto-incrementing ID for routing (0, 1, 2...)
  name: string
  url: string
  createdAt: string
  updatedAt: string
}
```

#### Session Types (from OpenCode SDK)

```typescript
// Leverage from @opencode-ai/sdk
import type { Session, SessionListResponse } from '@opencode-ai/sdk'

export interface ServerSession extends Session {
  serverId: string // Link to server UUID
  serverIdentifier: number // Link to server identifier
}
```

### Routing Structure

#### File-Based Route Hierarchy

```
src/routes/
├── servers.tsx                    # Existing servers list
├── servers.$serverId.tsx          # NEW: Server detail/layout route
├── servers.$serverId.sessions.tsx # NEW: Server sessions page
└── servers.$serverId.sessions.$sessionId.tsx # FUTURE: Individual session
```

#### Route Patterns

- **Servers List**: `/servers` (existing)
- **Server Sessions**: `/servers/$serverId/sessions` (new)
- **Dynamic Navigation**: Use `serverId` parameter to fetch server data

### Storage Layer Evolution

#### Migration Strategy

```typescript
// Version bump for schema changes
const STORAGE_VERSION = 2

function migrateServersData(data: ServersStorage): Array<Server> {
  if (data.version === 1) {
    // Migrate v1 to v2: Add auto-incrementing identifiers
    return data.servers.map((server, index) => ({
      ...server,
      identifier: index, // Assign sequential identifiers
    }))
  }
  return data.servers
}
```

#### Identifier Management

```typescript
// Helper functions for identifier management
export const serverIdentifierUtils = {
  getNextIdentifier: (servers: Server[]): number => {
    return Math.max(...servers.map((s) => s.identifier), -1) + 1
  },

  reassignIdentifiers: (servers: Server[]): Server[] => {
    return servers
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((server, index) => ({
        ...server,
        identifier: index,
      }))
  },
}
```

## Integration Patterns

### OpenCode SDK Integration

#### Client Configuration

```typescript
// Centralized OpenCode client
import Opencode from '@opencode-ai/sdk'

export const createOpencodeClient = (serverUrl: string) => {
  return new Opencode({
    baseURL: serverUrl,
    timeout: 30000,
    maxRetries: 2,
  })
}
```

#### Session Data Fetching

```typescript
// Custom hook for server sessions
export function useServerSessions(serverIdentifier: number) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Implementation with error handling and caching
}
```

### Navigation Integration

#### Enhanced Server Cards

- Add "View Sessions" action to server cards
- Navigate to `/servers/${server.identifier}/sessions`
- Maintain existing edit/delete functionality

#### Breadcrumb Navigation

```typescript
// Breadcrumb structure for sessions page
const breadcrumbs = [
  { label: 'Servers', href: '/servers' },
  { label: server.name, href: `/servers/${serverIdentifier}` },
  { label: 'Sessions', href: `/servers/${serverIdentifier}/sessions` },
]
```

### Component Architecture

#### Sessions Page Structure

```typescript
// Main sessions page component
function ServerSessionsPage() {
  const { serverId } = Route.useParams()
  const server = useServer(serverId)
  const { sessions, isLoading, error } = useServerSessions(server.identifier)

  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs items={breadcrumbs} />
      <ServerHeader server={server} />
      <SessionsList sessions={sessions} isLoading={isLoading} error={error} />
    </div>
  )
}
```

#### Session List Component

- Follow existing `ServersList` patterns
- Include session status indicators
- Support empty states and loading skeletons
- Add session actions (view, delete, share)

## Implementation Guidance

### Phase 1: Data Model Migration

1. **IMPORTANT**: Update `Server` interface to include `identifier` field
2. **IMPORTANT**: Implement storage migration logic for backward compatibility
3. Update server creation logic to assign next available identifier
4. Add identifier reassignment on server deletion

### Phase 2: Routing Setup

1. **IMPORTANT**: Create `/servers/$serverId.tsx` layout route
2. **IMPORTANT**: Create `/servers/$serverId.sessions.tsx` sessions route
3. Implement server data loading in route loader
4. Add error handling for invalid server identifiers

### Phase 3: OpenCode SDK Integration

1. Install `@opencode-ai/sdk` dependency
2. Create OpenCode client factory function
3. Implement session fetching with error handling
4. Add session data caching strategy

### Phase 4: UI Implementation

1. Create session list components following existing patterns
2. Add "View Sessions" navigation to server cards
3. Implement breadcrumb navigation
4. Add session status indicators and empty states

### Phase 5: Navigation Updates

1. Update server cards to include sessions navigation
2. Implement proper error boundaries for invalid routes
3. Add loading states for session data
4. Test navigation flow and browser history

## Critical Decisions

### IMPORTANT: Identifier Assignment Strategy

- **Decision**: Use auto-incrementing identifiers starting from 0
- **Rationale**: Provides clean, predictable URLs and easy navigation
- **Migration**: Assign identifiers based on creation date order for existing servers

### IMPORTANT: Route Structure

- **Decision**: Use `/servers/$serverId/sessions` pattern
- **Rationale**: Follows RESTful conventions and TanStack Router best practices
- **Benefit**: Scalable for future session-specific routes (`/servers/$serverId/sessions/$sessionId`)

### IMPORTANT: Error Handling

- **Decision**: Implement graceful degradation for API failures
- **Rationale**: OpenCode servers may be unavailable or misconfigured
- **Pattern**: Show error states with retry options and server status indicators

### IMPORTANT: Data Caching

- **Decision**: Implement client-side caching for session data
- **Rationale**: Reduce API calls and improve perceived performance
- **Strategy**: Use TanStack Query or simple in-memory caching with TTL

## Security Considerations

### API Security

- Validate server URLs before making OpenCode API calls
- Implement proper error handling for authentication failures
- Consider adding server authentication configuration

### Data Privacy

- Ensure session data is handled securely in memory
- Clear sensitive data when navigating away from sessions
- Consider adding session data encryption if storing locally

## Performance Considerations

### Lazy Loading

- Implement lazy loading for session messages
- Use pagination or virtual scrolling for large session lists
- Cache session metadata separately from message content

### Network Optimization

- Debounce API calls when possible
- Implement request cancellation on navigation
- Use appropriate timeout values for OpenCode API calls

## Testing Strategy

### Unit Tests

- Test identifier assignment logic
- Test storage migration functions
- Test OpenCode client configuration

### Integration Tests

- Test navigation flow between servers and sessions
- Test error handling for invalid server identifiers
- Test OpenCode API integration with mock responses

### E2E Tests

- Test complete user flow from server creation to session viewing
- Test browser navigation and history
- Test responsive design on different screen sizes

## Future Enhancements

### Session Management

- Individual session detail pages
- Session creation and editing capabilities
- Session sharing and collaboration features

### Advanced Features

- Real-time session updates
- Session search and filtering
- Session analytics and insights

### Integration Improvements

- Multiple OpenCode server support
- Server health monitoring
- Automated session backups
