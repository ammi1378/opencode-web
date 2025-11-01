# Implementation Plan: Server Sessions Page

## Implementation Overview

This implementation extends the existing server management system to support individual server session views using the OpenCode SDK. The approach involves:

1. **Data Model Migration**: Add auto-incrementing `identifier` field to the `Server` interface with backward-compatible migration from version 1 to version 2 of the storage schema
2. **Routing Architecture**: Implement TanStack Router file-based routes following the pattern `/servers/$serverId/sessions` using the server's identifier as the URL parameter
3. **OpenCode SDK Integration**: Create a centralized SDK client factory and session data fetching hooks leveraging the `@opencode-ai/sdk` package
4. **UI Components**: Build session list components following existing ShadCN UI patterns from the servers page
5. **Navigation Flow**: Update server cards with "View Sessions" action and implement breadcrumb navigation

The solution maintains consistency with existing patterns while introducing new capabilities for session management per server.

---

## Component Details

### 1. Type Definitions

#### File: `src/lib/servers/types.ts`

**Modifications Required:**

- Add `identifier` field to `Server` interface
- Increment `STORAGE_VERSION` constant
- Add session-related types imported from OpenCode SDK

**Updated Interface Structure:**

```typescript
export interface Server {
  id: string // Existing UUID for internal operations
  identifier: number // NEW: Auto-incrementing ID for URL routing (0, 1, 2...)
  name: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface ServersStorage {
  version: number // Bump to 2
  servers: Array<Server>
}
```

**New Types for Sessions:**

```typescript
// Re-export from OpenCode SDK for type safety
export type { Session, SessionListResponse } from '@opencode-ai/sdk'

// Extended session type with server linkage
export interface ServerSessionMetadata {
  serverId: string // Link to server UUID
  serverIdentifier: number // Link to server identifier
  serverName: string // Cached server name for display
  serverUrl: string // Cached server URL
}
```

---

### 2. Storage Layer Updates

#### File: `src/lib/servers/storage.ts`

**Changes Required:**

- Update `STORAGE_VERSION` from 1 to 2
- Implement migration logic in `migrateServersData` function
- Add identifier management utilities

**Migration Implementation:**

```typescript
const STORAGE_VERSION = 2 // Bumped from 1

function migrateServersData(data: ServersStorage): Array<Server> {
  if (data.version === 1) {
    // Migration: Add identifiers based on creation date order
    const serversWithIdentifiers = data.servers
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((server, index) => ({
        ...server,
        identifier: index,
      }))

    // Save migrated data back to storage
    const migratedData: ServersStorage = {
      version: 2,
      servers: serversWithIdentifiers,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData))

    return serversWithIdentifiers
  }

  return data.servers
}
```

**New Utility Functions:**

```typescript
// Helper functions for identifier management
export const serverIdentifierUtils = {
  // Get next available identifier
  getNextIdentifier(servers: Array<Server>): number {
    if (servers.length === 0) return 0
    const maxIdentifier = Math.max(...servers.map((s) => s.identifier))
    return maxIdentifier + 1
  },

  // Reassign identifiers sequentially (used after deletion)
  reassignIdentifiers(servers: Array<Server>): Array<Server> {
    return servers
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((server, index) => ({
        ...server,
        identifier: index,
      }))
  },

  // Find server by identifier
  findByIdentifier(
    servers: Array<Server>,
    identifier: number,
  ): Server | undefined {
    return servers.find((s) => s.identifier === identifier)
  },
}
```

---

### 3. Hooks Layer Updates

#### File: `src/lib/servers/hooks.ts`

**Modifications Required:**

- Update `addServer` to assign identifier using utility
- Update `deleteServer` to reassign identifiers after deletion
- Add new hook `useServerByIdentifier` for route param lookup

**Updated `addServer` Implementation:**

```typescript
const addServer = useCallback(
  async (formData: ServerFormData): Promise<void> => {
    const validated = serverFormSchema.parse(formData)

    if (!validateUniqueServerName(validated.name, servers)) {
      throw new Error('A server with this name already exists')
    }

    const newServer: Server = {
      id: crypto.randomUUID(),
      identifier: serverIdentifierUtils.getNextIdentifier(servers), // NEW
      name: validated.name,
      url: validated.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedServers = [...servers, newServer]
    serversStorage.set(updatedServers)
    setServers(updatedServers)
  },
  [servers],
)
```

**Updated `deleteServer` Implementation:**

```typescript
const deleteServer = useCallback(
  async (serverId: string): Promise<void> => {
    const filteredServers = servers.filter((server) => server.id !== serverId)

    // Reassign identifiers to maintain sequential order
    const reassignedServers =
      serverIdentifierUtils.reassignIdentifiers(filteredServers)

    serversStorage.set(reassignedServers)
    setServers(reassignedServers)
  },
  [servers],
)
```

**New Hook:**

```typescript
// Hook to find server by identifier (for route params)
export function useServerByIdentifier(identifier: number): Server | undefined {
  const { servers } = useServers()
  return serverIdentifierUtils.findByIdentifier(servers, identifier)
}
```

---

### 4. OpenCode SDK Client Factory

#### File: `src/lib/opencode/client.ts` (NEW)

**Purpose:** Centralized OpenCode SDK client creation and configuration

```typescript
import Opencode from '@opencode-ai/sdk'

export interface OpencodeClientConfig {
  serverUrl: string
  timeout?: number
  maxRetries?: number
}

export function createOpencodeClient(config: OpencodeClientConfig): Opencode {
  return new Opencode({
    baseURL: config.serverUrl,
    timeout: config.timeout ?? 30000, // 30 seconds default
    maxRetries: config.maxRetries ?? 2,
  })
}

// Error handling types
export { APIError } from '@opencode-ai/sdk'
```

---

### 5. Session Management Hooks

#### File: `src/lib/opencode/sessions.ts` (NEW)

**Purpose:** React hooks for fetching and managing session data

```typescript
import { useState, useEffect, useCallback } from 'react'
import type { Session, SessionListResponse } from '@opencode-ai/sdk'
import { createOpencodeClient, APIError } from './client'
import type { Server } from '@/lib/servers/types'

export interface UseSessionsResult {
  sessions: Session[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSessions(server: Server): UseSessionsResult {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const client = createOpencodeClient({ serverUrl: server.url })
      const response: SessionListResponse = await client.session.list()
      setSessions(response.sessions || [])
    } catch (err) {
      if (err instanceof APIError) {
        setError(`API Error (${err.status}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to fetch sessions')
      }
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }, [server.url])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    isLoading,
    error,
    refetch: fetchSessions,
  }
}
```

---

### 6. Route Files

#### File: `src/routes/servers.$serverId.tsx` (NEW)

**Purpose:** Layout route for individual server (future: could show server details)

```typescript
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { serverIdentifierUtils } from '@/lib/servers/storage'
import { useServers } from '@/lib/servers/hooks'

export const Route = createFileRoute('/servers/$serverId')({
  component: ServerLayout,
})

function ServerLayout() {
  const { serverId } = Route.useParams()
  const { servers } = useServers()

  // Parse serverId as number
  const identifier = parseInt(serverId, 10)
  const server = serverIdentifierUtils.findByIdentifier(servers, identifier)

  // Handle invalid server identifier
  if (isNaN(identifier) || !server) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Server Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The server you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  // Render child routes with server context
  return <Outlet />
}
```

#### File: `src/routes/servers.$serverId.sessions.tsx` (NEW)

**Purpose:** Sessions list page for individual server

```typescript
import { createFileRoute, Link } from '@tanstack/react-router'
import { serverIdentifierUtils } from '@/lib/servers/storage'
import { useServers } from '@/lib/servers/hooks'
import { useSessions } from '@/lib/opencode/sessions'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SessionsList } from '@/components/sessions/sessions-list'

export const Route = createFileRoute('/servers/$serverId/sessions')({
  component: ServerSessionsPage,
})

function ServerSessionsPage() {
  const { serverId } = Route.useParams()
  const { servers } = useServers()

  const identifier = parseInt(serverId, 10)
  const server = serverIdentifierUtils.findByIdentifier(servers, identifier)

  // This check is redundant if parent route handles it, but kept for safety
  if (!server) {
    return null
  }

  const { sessions, isLoading, error, refetch } = useSessions(server)

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/servers">Servers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{server.name}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sessions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Server Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{server.name} Sessions</h1>
        <p className="text-muted-foreground mt-1">{server.url}</p>
      </div>

      {/* Sessions List */}
      <SessionsList
        sessions={sessions}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
      />
    </div>
  )
}
```

---

### 7. Session Components

#### File: `src/components/sessions/sessions-list.tsx` (NEW)

**Purpose:** List container for sessions (follows pattern from servers-list)

```typescript
import type { Session } from '@opencode-ai/sdk'
import { SessionCard } from './session-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface SessionsListProps {
  sessions: Session[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export function SessionsList({
  sessions,
  isLoading,
  error,
  onRefresh,
}: SessionsListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive">
              Failed to Load Sessions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-dashed">
        <h3 className="text-lg font-semibold">No Sessions Found</h3>
        <p className="text-muted-foreground mt-2">
          This server doesn't have any active sessions yet.
        </p>
      </div>
    )
  }

  // Sessions Grid
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} found
        </p>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}
```

#### File: `src/components/sessions/session-card.tsx` (NEW)

**Purpose:** Individual session card display (follows pattern from server-card)

```typescript
import type { Session } from '@opencode-ai/sdk'
import { MessageSquare, Calendar } from 'lucide-react'

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold">
              {session.title || `Session ${session.id.slice(0, 8)}`}
            </h3>
            {session.summary && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {session.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(session.created_at).toLocaleDateString()}
          </span>
        </div>
        {session.message_count !== undefined && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{session.message_count} messages</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### 8. Server Card Navigation Update

#### File: `src/components/servers/server-card.tsx`

**Modifications Required:**

- Add "View Sessions" button/menu item
- Import Link from TanStack Router
- Use server.identifier for navigation

**Updated DropdownMenu Section:**

```typescript
import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react' // Add to imports

// In DropdownMenuContent:
<DropdownMenuContent align="end">
  <DropdownMenuItem asChild>
    <Link to="/servers/$serverId/sessions" params={{ serverId: server.identifier.toString() }}>
      <Eye className="mr-2 h-4 w-4" />
      View Sessions
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => onEdit(server)}>
    <Edit className="mr-2 h-4 w-4" />
    Edit
  </DropdownMenuItem>
  <DropdownMenuItem
    onClick={() => onDelete(server.id)}
    className="text-destructive"
  >
    <Trash2 className="mr-2 h-4 w-4" />
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Data Structures

### Server Interface Evolution

**Version 1 (Current):**

```typescript
{
  id: string
  name: string
  url: string
  createdAt: string
  updatedAt: string
}
```

**Version 2 (Updated):**

```typescript
{
  id: string
  identifier: number // NEW: Auto-incrementing
  name: string
  url: string
  createdAt: string
  updatedAt: string
}
```

### Storage Schema Migration

**Version 1 → Version 2:**

- Trigger: `data.version === 1`
- Process: Sort servers by `createdAt`, assign sequential identifiers starting from 0
- Persistence: Save updated data with `version: 2`

### Session Types (from OpenCode SDK)

Based on Context7 documentation, the SDK provides:

```typescript
// From @opencode-ai/sdk
interface Session {
  id: string
  title?: string
  summary?: string
  created_at: string
  updated_at?: string
  message_count?: number
  // Additional fields based on SDK response
}

interface SessionListResponse {
  sessions: Session[]
}
```

---

## API Design

### OpenCode SDK Integration Architecture

#### Client Configuration

**Location:** `src/lib/opencode/client.ts`

**Factory Pattern:**

```typescript
createOpencodeClient(config: OpencodeClientConfig): Opencode
```

**Configuration Options:**

- `serverUrl`: Base URL of the OpenCode server
- `timeout`: Request timeout (default: 30000ms)
- `maxRetries`: Number of retry attempts (default: 2)

#### Session API Methods Used

Based on Context7 documentation:

1. **`client.session.list()`**
   - **Endpoint:** GET /session
   - **Returns:** SessionListResponse
   - **Usage:** Fetch all sessions for a server
   - **Error Handling:** Wrap in try-catch for APIError

2. **Future: `client.session.messages(id)`**
   - **Endpoint:** GET /session/{id}/message
   - **Returns:** SessionMessagesResponse
   - **Usage:** Fetch message history for individual session

### Custom Hooks API

#### `useSessions(server: Server)`

**Purpose:** Fetch and manage sessions for a specific server

**Returns:**

```typescript
{
  sessions: Session[]     // Array of session objects
  isLoading: boolean      // Loading state
  error: string | null    // Error message if any
  refetch: () => void     // Manual refetch function
}
```

**Implementation Details:**

- Uses `useEffect` to fetch on mount and when server URL changes
- Implements proper error handling for APIError
- Provides loading states for UI feedback

#### `useServerByIdentifier(identifier: number)`

**Purpose:** Find server by identifier for route params

**Returns:**

```typescript
Server | undefined
```

**Usage in Routes:**

```typescript
const { serverId } = Route.useParams()
const identifier = parseInt(serverId, 10)
const server = useServerByIdentifier(identifier)
```

---

## Testing Strategy

### Unit Tests

#### Storage Migration Tests

**File:** `src/lib/servers/storage.test.ts`

**Test Cases:**

1. **Test: Migrate from version 1 to version 2**
   - Given: Storage with version 1 data (no identifiers)
   - When: `migrateServersData` is called
   - Then: Each server has sequential identifier based on creation date

2. **Test: Identifier assignment maintains order**
   - Given: 3 servers created at different times
   - When: Migration occurs
   - Then: Earliest server gets identifier 0, next gets 1, etc.

3. **Test: Empty server list migration**
   - Given: Storage with version 1 and empty servers array
   - When: Migration occurs
   - Then: Returns empty array without errors

#### Identifier Utility Tests

**File:** `src/lib/servers/storage.test.ts` (add new tests)

**Test Cases:**

1. **Test: getNextIdentifier with empty array**
   - Given: Empty servers array
   - When: getNextIdentifier is called
   - Then: Returns 0

2. **Test: getNextIdentifier with existing servers**
   - Given: Servers with identifiers [0, 1, 2]
   - When: getNextIdentifier is called
   - Then: Returns 3

3. **Test: reassignIdentifiers after deletion**
   - Given: Servers with identifiers [0, 1, 2, 3]
   - When: Server with identifier 1 is deleted and reassignIdentifiers called
   - Then: Remaining servers have identifiers [0, 1, 2]

4. **Test: findByIdentifier returns correct server**
   - Given: Multiple servers
   - When: findByIdentifier is called with valid identifier
   - Then: Returns correct server

5. **Test: findByIdentifier returns undefined for invalid identifier**
   - Given: Servers with identifiers [0, 1, 2]
   - When: findByIdentifier is called with identifier 5
   - Then: Returns undefined

### Integration Tests

#### Navigation Flow Tests

**Test Cases:**

1. **Test: Navigate from servers list to sessions**
   - Given: User is on /servers page
   - When: User clicks "View Sessions" on a server card
   - Then: Navigates to /servers/0/sessions (or appropriate identifier)

2. **Test: Invalid server identifier handling**
   - Given: User navigates to /servers/999/sessions
   - When: Server with identifier 999 doesn't exist
   - Then: Shows "Server Not Found" error message

3. **Test: Breadcrumb navigation**
   - Given: User is on sessions page
   - When: User clicks "Servers" breadcrumb
   - Then: Navigates back to /servers

#### OpenCode API Integration Tests

**Test Cases:**

1. **Test: Successful session fetch**
   - Given: Mock OpenCode server returns session list
   - When: useSessions hook is called
   - Then: Sessions are displayed in UI

2. **Test: API error handling**
   - Given: OpenCode server returns 500 error
   - When: useSessions hook is called
   - Then: Error state is shown with appropriate message

3. **Test: Network timeout handling**
   - Given: OpenCode server doesn't respond within timeout
   - When: useSessions hook is called
   - Then: Timeout error is shown

4. **Test: Refetch functionality**
   - Given: Sessions are loaded
   - When: User clicks refresh button
   - Then: Sessions are fetched again from server

### E2E Tests

#### Complete User Flow

**Test Scenario 1: Create server and view sessions**

1. User creates a new server
2. Server is assigned identifier 0
3. User clicks "View Sessions" on the server
4. Navigates to /servers/0/sessions
5. Sessions list loads (or shows empty state)

**Test Scenario 2: Delete server and identifier reassignment**

1. User has 3 servers (identifiers: 0, 1, 2)
2. User deletes server with identifier 1
3. Remaining servers are reassigned identifiers (0, 1)
4. Links to sessions pages still work correctly

**Test Scenario 3: Browser navigation**

1. User navigates to sessions page
2. User uses browser back button
3. Returns to servers list
4. User uses browser forward button
5. Returns to sessions page

---

## Development Phases

### Phase 1: Data Model Migration (CRITICAL FOUNDATION)

**Duration:** 1-2 hours

**Tasks:**

1. Update `src/lib/servers/types.ts`
   - Add `identifier: number` to Server interface
   - Update ServersStorage version type if needed

2. Update `src/lib/servers/storage.ts`
   - Change STORAGE_VERSION from 1 to 2
   - Implement migrateServersData function with identifier assignment
   - Add serverIdentifierUtils object with helper functions
   - Write comprehensive unit tests for migration

3. Update `src/lib/servers/hooks.ts`
   - Modify addServer to use getNextIdentifier
   - Modify deleteServer to use reassignIdentifiers
   - Add useServerByIdentifier hook

4. Update `src/lib/servers/validation.test.ts` and `storage.test.ts`
   - Add test cases for identifier assignment
   - Test migration logic
   - Test identifier utilities

**Acceptance Criteria:**

- ✅ All existing servers in localStorage get sequential identifiers
- ✅ New servers get correct next identifier
- ✅ Server deletion triggers identifier reassignment
- ✅ All tests pass
- ✅ No breaking changes to existing server functionality

---

### Phase 2: OpenCode SDK Setup (INTEGRATION FOUNDATION)

**Duration:** 2-3 hours

**Tasks:**

1. Install OpenCode SDK

   ```bash
   pnpm add @opencode-ai/sdk
   ```

2. Create `src/lib/opencode/` directory

3. Create `src/lib/opencode/client.ts`
   - Implement createOpencodeClient factory
   - Export APIError for error handling
   - Add TypeScript types for configuration

4. Create `src/lib/opencode/sessions.ts`
   - Implement useSessions hook
   - Add proper error handling with APIError
   - Implement loading states
   - Add refetch capability

5. Create unit tests for client configuration
   - Test client creation with different configs
   - Mock API responses for testing

**Acceptance Criteria:**

- ✅ OpenCode SDK properly installed
- ✅ Client factory creates configured instances
- ✅ useSessions hook fetches data correctly
- ✅ Error handling works for network failures
- ✅ Loading states are properly managed

---

### Phase 3: Routing Implementation (NAVIGATION FOUNDATION)

**Duration:** 2-3 hours

**Tasks:**

1. Create `src/routes/servers.$serverId.tsx`
   - Implement layout route
   - Add server validation logic
   - Handle invalid identifiers with error UI
   - Use Outlet for child routes

2. Create `src/routes/servers.$serverId.sessions.tsx`
   - Implement sessions page component
   - Add breadcrumb navigation
   - Integrate useSessions hook
   - Add server header with name and URL

3. Test route navigation
   - Verify /servers/0/sessions works
   - Test invalid identifiers show error
   - Test breadcrumb links

**Acceptance Criteria:**

- ✅ Route files created following TanStack Router conventions
- ✅ Dynamic serverId parameter works correctly
- ✅ Invalid server IDs show appropriate error
- ✅ Breadcrumbs render and navigate correctly
- ✅ Server context is available to child routes

---

### Phase 4: UI Components (PRESENTATION LAYER)

**Duration:** 3-4 hours

**Tasks:**

1. Create `src/components/sessions/` directory

2. Create `src/components/sessions/sessions-list.tsx`
   - Implement loading state with skeletons
   - Implement error state with retry button
   - Implement empty state
   - Implement sessions grid layout
   - Add refresh button

3. Create `src/components/sessions/session-card.tsx`
   - Display session title/ID
   - Show session summary if available
   - Display created date
   - Show message count
   - Add hover effects

4. Add ShadCN icons if needed
   - Import from lucide-react
   - Use MessageSquare, Calendar, AlertCircle, etc.

**Acceptance Criteria:**

- ✅ Loading state shows skeleton cards
- ✅ Error state displays error message with retry
- ✅ Empty state shows helpful message
- ✅ Session cards display all relevant information
- ✅ UI follows existing design patterns
- ✅ Responsive layout works on mobile/tablet/desktop

---

### Phase 5: Navigation Updates (USER FLOW COMPLETION)

**Duration:** 1-2 hours

**Tasks:**

1. Update `src/components/servers/server-card.tsx`
   - Add "View Sessions" menu item
   - Import Link from TanStack Router
   - Use server.identifier for navigation params
   - Add Eye icon from lucide-react

2. Test navigation flow
   - Click "View Sessions" from server card
   - Verify correct identifier in URL
   - Verify sessions page loads

3. Update navigation config if needed
   - Consider adding sessions to breadcrumb
   - Ensure type safety with router

**Acceptance Criteria:**

- ✅ "View Sessions" appears in server card dropdown
- ✅ Clicking navigates to correct sessions page
- ✅ Navigation uses identifier not UUID
- ✅ All existing server actions still work

---

### Phase 6: Testing & Polish (QUALITY ASSURANCE)

**Duration:** 2-3 hours

**Tasks:**

1. Write integration tests
   - Test full navigation flow
   - Test API error scenarios
   - Test loading states

2. Add E2E tests if applicable
   - Test complete user journey
   - Test browser navigation

3. Error boundary testing
   - Test invalid routes
   - Test API failures
   - Test network timeouts

4. Performance testing
   - Verify no unnecessary re-renders
   - Check bundle size impact
   - Test with large session lists

5. Accessibility audit
   - Keyboard navigation
   - Screen reader support
   - Focus management

6. Documentation
   - Update README if needed
   - Add code comments
   - Document SDK integration

**Acceptance Criteria:**

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Error handling works gracefully
- ✅ Performance is acceptable
- ✅ Accessibility standards met
- ✅ Code is well-documented

---

## Migration Strategy Details

### Backward Compatibility Approach

**Storage Version Detection:**

```typescript
if (parsed.version !== STORAGE_VERSION) {
  return migrateServersData(parsed)
}
```

**Migration Process:**

1. Detect version 1 storage
2. Sort servers by creation date (oldest first)
3. Assign sequential identifiers (0, 1, 2...)
4. Save back to localStorage with version 2
5. Return migrated servers

**Identifier Assignment Rules:**

- First server created gets identifier 0
- Each subsequent server increments by 1
- Deletion causes reassignment to maintain sequential order
- Order is based on `createdAt` timestamp

**Edge Cases Handled:**

- Empty server list: No migration needed
- Single server: Gets identifier 0
- Mixed creation dates: Sorted chronologically
- Concurrent tabs: Last write wins (localStorage behavior)

### Data Integrity Guarantees

1. **No Data Loss:** Migration preserves all existing server data
2. **Atomicity:** Migration completes fully or not at all
3. **Idempotency:** Running migration multiple times has same result
4. **Validation:** Schema version is always checked before reading

---

## TanStack Router Route Configuration

### File-Based Routing Pattern

Following TanStack Router conventions from `.github/instructions/`:

**Route Hierarchy:**

```
src/routes/
├── __root.tsx                           (existing)
├── servers.tsx                          (existing)
├── servers.$serverId.tsx                (NEW - layout route)
└── servers.$serverId.sessions.tsx       (NEW - sessions page)
```

**URL to Component Mapping:**

- `/servers` → `<Root><ServersPage>`
- `/servers/0/sessions` → `<Root><ServerLayout><ServerSessionsPage>`
- `/servers/1/sessions` → `<Root><ServerLayout><ServerSessionsPage>`

### Dynamic Route Parameters

**Parameter Name:** `$serverId`

- **Type:** string (parsed to number)
- **Access:** `Route.useParams()`
- **Validation:** parseInt and server lookup

**Usage Example:**

```typescript
const { serverId } = Route.useParams()
const identifier = parseInt(serverId, 10)

if (isNaN(identifier)) {
  // Handle invalid parameter
}
```

### Type Safety

TanStack Router provides:

- Type-safe route parameters
- Autocomplete for route paths
- Compile-time route validation

**Example:**

```typescript
<Link
  to="/servers/$serverId/sessions"
  params={{ serverId: server.identifier.toString() }}
>
  {/* TypeScript knows this route exists and requires serverId param */}
</Link>
```

---

## OpenCode SDK Integration Details

### Installation

```bash
pnpm add @opencode-ai/sdk
```

### Client Initialization Pattern

**Based on Context7 Documentation:**

```typescript
import Opencode from '@opencode-ai/sdk'

const client = new Opencode({
  baseURL: 'http://localhost:8000', // Server URL
  timeout: 30000, // 30 second timeout
  maxRetries: 2, // Retry failed requests
})
```

### Session List API Usage

**Method:** `client.session.list()`

- **HTTP:** GET /session
- **Returns:** `SessionListResponse`
- **Fields:** `{ sessions: Session[] }`

**Error Handling:**

```typescript
try {
  const response = await client.session.list()
  return response.sessions
} catch (err) {
  if (err instanceof Opencode.APIError) {
    // Handle API-specific errors
    console.error(`API Error ${err.status}: ${err.message}`)
  } else {
    // Handle other errors
    throw err
  }
}
```

### Future Session Messages API

**Method:** `client.session.messages(id)`

- **HTTP:** GET /session/{id}/message
- **Returns:** `SessionMessagesResponse`
- **Usage:** Individual session detail page (future enhancement)

### SDK Configuration Options

**Timeout:**

- Default: 60000ms (1 minute)
- Recommended: 30000ms (30 seconds)
- Per-request override available

**Retries:**

- Default: 2
- Configurable per client
- Per-request override available

**Custom Headers:**

- Can be added via fetchOptions
- Useful for authentication (future)

---

## Critical Implementation Notes

### IMPORTANT: Data Migration

**⚠️ CRITICAL:** The storage migration MUST be implemented correctly to avoid data loss:

1. Always check version before migration
2. Save migrated data immediately
3. Test with existing production data
4. Consider adding version rollback mechanism

### IMPORTANT: Identifier Stability

**⚠️ CRITICAL:** Identifier reassignment on deletion:

- **Pro:** Keeps URLs clean and sequential
- **Con:** Bookmarked URLs may break
- **Mitigation:** Use UUID as fallback in route params (future enhancement)
- **Decision:** Accept URL instability for cleaner UX

**Alternative Approach (Future):**

- Keep identifiers stable (no reassignment)
- Accept gaps in sequence
- Update `getNextIdentifier` to find first available gap

### IMPORTANT: Error Handling

**⚠️ CRITICAL:** OpenCode servers may be unavailable:

1. Always wrap API calls in try-catch
2. Show user-friendly error messages
3. Provide retry mechanism
4. Don't crash on network errors

### IMPORTANT: Type Safety

**⚠️ CRITICAL:** Maintain TypeScript strict mode:

1. Use proper types from OpenCode SDK
2. Validate route parameters
3. Handle undefined cases
4. No `any` types

---

## Security Considerations

### URL Validation

**Server URL Input:**

- Validate URL format before saving
- Sanitize URLs before API calls
- Consider HTTPS-only enforcement (future)

**Route Parameter Validation:**

- Always parse serverId to number
- Check for NaN
- Verify server exists
- Handle malicious inputs gracefully

### API Security

**OpenCode Server Access:**

- Servers are defined by user (trusted)
- No authentication implemented yet
- Consider adding API key support (future)
- Validate responses before rendering

### Data Privacy

**Session Data:**

- Not persisted locally (only in memory)
- Cleared on navigation away
- Consider adding session data encryption (future)

---

## Performance Considerations

### Lazy Loading

**Route Code Splitting:**

- TanStack Router supports automatic code splitting
- Sessions components only load when route is visited
- OpenCode SDK bundled separately

**Component Lazy Loading:**

```typescript
// Future enhancement
const SessionCard = lazy(() => import('./session-card'))
```

### API Optimization

**Caching Strategy:**

- Current: No caching (always fresh data)
- Future: Implement stale-while-revalidate
- Consider using TanStack Query for advanced caching

**Request Optimization:**

- Set appropriate timeout values
- Implement debounce for refresh
- Cancel requests on unmount

### Bundle Size

**OpenCode SDK Impact:**

- Expected: ~50-100KB
- Mitigate: Tree-shaking unused SDK features
- Monitor: Add bundle size tracking

---

## Future Enhancements

### Individual Session Detail Page

**Route:** `/servers/$serverId/sessions/$sessionId`
**Features:**

- View full session history
- Display message thread
- Show session metadata
- Add session actions (delete, share)

### Session Search and Filtering

**Features:**

- Search sessions by title/content
- Filter by date range
- Sort by various criteria
- Pagination for large lists

### Real-time Updates

**Features:**

- WebSocket connection to OpenCode server
- Live session updates
- New session notifications
- Active session indicators

### Server Health Monitoring

**Features:**

- Ping OpenCode servers periodically
- Display online/offline status
- Show last successful connection
- Alert on server issues

### Session Analytics

**Features:**

- Total sessions per server
- Message count statistics
- Usage trends over time
- Export session data

---

## Success Criteria

### Functional Requirements

✅ Each server has unique auto-incrementing identifier
✅ Existing servers migrated without data loss
✅ New servers assigned correct identifier
✅ Sessions page accessible via /servers/{id}/sessions
✅ Sessions list displays correctly
✅ OpenCode SDK integrated successfully
✅ Error handling works gracefully
✅ Loading states provide feedback
✅ Navigation flow is intuitive

### Non-Functional Requirements

✅ No breaking changes to existing features
✅ Performance remains acceptable
✅ Code follows project conventions
✅ Type safety maintained throughout
✅ Tests provide adequate coverage
✅ Documentation is clear and complete

### User Experience

✅ Clean, intuitive UI
✅ Responsive design works on all devices
✅ Error messages are helpful
✅ Loading states are smooth
✅ Navigation is predictable
✅ Breadcrumbs aid navigation

---

## Rollback Plan

### If Migration Fails

1. **Detect failure:** Catch errors in migrateServersData
2. **Log error:** Console error with details
3. **Fallback:** Return empty array or existing data
4. **Alert user:** Show migration error message
5. **Preserve data:** Don't overwrite storage on failure

### If Route Implementation Issues

1. **Disable routes:** Comment out route files
2. **Remove navigation:** Hide "View Sessions" button
3. **Revert changes:** Use git to restore previous state
4. **Fix issues:** Address problems in isolation
5. **Redeploy:** Test thoroughly before re-enabling

### Version Rollback

**Storage Downgrade (Version 2 → 1):**

```typescript
function downgradeToV1(servers: Server[]): Server[] {
  return servers.map(({ identifier, ...rest }) => rest)
}
```

**Note:** Downgrade loses identifier data; only use if critical

---

## Dependencies Summary

### NPM Packages

**New:**

- `@opencode-ai/sdk` - OpenCode SDK for session management

**Existing:**

- `@tanstack/react-router` - Routing
- `lucide-react` - Icons
- `zod` - Validation
- React, TypeScript, etc.

### Internal Dependencies

**Modified Files:**

- `src/lib/servers/types.ts`
- `src/lib/servers/storage.ts`
- `src/lib/servers/hooks.ts`
- `src/components/servers/server-card.tsx`

**New Files:**

- `src/lib/opencode/client.ts`
- `src/lib/opencode/sessions.ts`
- `src/routes/servers.$serverId.tsx`
- `src/routes/servers.$serverId.sessions.tsx`
- `src/components/sessions/sessions-list.tsx`
- `src/components/sessions/session-card.tsx`

---

## Conclusion

This implementation plan provides a comprehensive, step-by-step approach to adding server session management functionality to the OpenCode UI application. The plan prioritizes:

1. **Backward Compatibility:** Existing data is preserved through careful migration
2. **Type Safety:** Leverages TypeScript and TanStack Router for compile-time guarantees
3. **User Experience:** Follows established patterns for consistency
4. **Maintainability:** Clear separation of concerns and well-documented code
5. **Extensibility:** Foundation for future enhancements

By following this plan in phases, the implementation can be completed incrementally with testing at each step, ensuring a stable and reliable feature rollout.
