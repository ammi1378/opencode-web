# Architectural Analysis: Implement Session Chat Read-Only Route

## Context Analysis

The task requires implementing a read-only chat view for session messages at the route `/servers/:serverId/:sessionId/chat`. This feature will allow users to inspect message history within a specific session without providing any interaction capabilities. The implementation needs to integrate with the existing TanStack Router file-based routing system, leverage React Query for data fetching, and use ShadCN UI components for consistent styling.

The route structure follows the existing pattern of nested dynamic routes in the servers section, building upon the foundation established by the servers management and sessions pages. The OpenCode SDK provides the necessary API endpoints for retrieving session messages, which will be integrated through a React Query hook.

## Technology Recommendations

### TanStack Router File-Based Routing

- **Route Pattern**: Use flat file naming `$serverId_.$sessionId.chat.tsx` to match `/servers/:serverId/:sessionId/chat`
- **Parameter Handling**: Leverage TanStack Router's type-safe parameter extraction for `serverId` and `sessionId`
- **Navigation Integration**: Implement breadcrumb navigation with flat route structure awareness

### React Query for Data Fetching

- **Hook Architecture**: Create a dedicated hook `useSessionMessages` following the existing `useServerSessions` pattern
- **Caching Strategy**: Implement appropriate caching for session messages to optimize performance
- **Error Handling**: Leverage React Query's built-in error states and retry mechanisms

### OpenCode SDK Integration

- **API Endpoint**: Use `client.session.messages(sessionId)` for retrieving message history
- **Data Structure**: Handle the response format `{ info: Message, parts: Part[] }[]` as documented in the SDK
- **Client Management**: Reuse the existing OpenCode client creation pattern from server configuration

### ShadCN UI Components

- **Layout**: Use `Card` components for message containers
- **Visual Separation**: Implement `Separator` components between messages
- **Loading States**: Leverage `Skeleton` components for placeholder content
- **Consistency**: Follow existing component patterns from sessions and servers pages

## System Architecture

### Route Structure

```
src/routes/servers/$serverId_.$sessionId.chat.tsx
```

This flat file structure creates the route `/servers/:serverId/:sessionId/chat` while maintaining consistency with existing route naming conventions. The underscore in `$serverId_` ensures proper route matching without nesting under the servers layout.

### Component Architecture

```
SessionChatRoute (main route component)
├── Header (breadcrumb + session info)
├── MessageList (container for messages)
│   ├── MessageCard (individual message)
│   │   ├── MessageHeader (role, timestamp)
│   │   └── MessageContent (message parts)
│   └── LoadingSkeleton (loading state)
└── ErrorBoundary (error handling)
```

### Data Flow Architecture

```
Route Component
├── useParams() → serverId, sessionId
├── useServers() → server validation
├── useSessionMessages() → message data
│   ├── OpenCode Client Creation
│   ├── API Call: client.session.messages()
│   └── React Query Caching
└── UI Rendering → ShadCN Components
```

## Integration Patterns

### Parameter Validation Pattern

```typescript
// Validate server exists before proceeding
const { serverId, sessionId } = Route.useParams()
const { servers } = useServers()
const server = servers.find((s) => s.identifier === parseInt(serverId))

if (!server) {
  return <ServerErrorState />
}
```

### React Query Hook Pattern

```typescript
// Follow existing useServerSessions pattern
export function useSessionMessages(server: Server | null, sessionId: string) {
  const [client, setClient] = useState<OpencodeClient | null>(null)

  // Client initialization
  // Message fetching with error handling
  // Return { messages, isLoading, error, refetch }
}
```

### CRITICAL: BreadcrumbNav Integration for Flat Route Structure

The flat route structure `/servers/:serverId/:sessionId/chat` **REQUIRES** special handling in BreadcrumbNav since it doesn't follow the nested pattern. The implementation **MUST**:

```typescript
// In BreadcrumbNav component - detect chat route pattern
const pathname = useLocation().pathname
const isChatRoute = pathname.match(/^\/servers\/([^\/]+)\/([^\/]+)\/chat$/)

if (isChatRoute) {
  const [, serverId, sessionId] = isChatRoute
  const { servers } = useServers()
  const server = servers.find(s => s.identifier === parseInt(serverId))

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/servers">Servers</BreadcrumbLink>
      </BreadcrumbItem>
      {server && (
        <BreadcrumbItem>
          <BreadcrumbLink href={`/servers/${serverId}/sessions`}>
            {server.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
      <BreadcrumbItem>
        <BreadcrumbLink href={`/servers/${serverId}/sessions`}>
          Sessions
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Chat</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  )
}
```

**REQUIRED**: Include "Sessions" crumb linking to `/servers/:serverId/sessions` for proper navigation hierarchy.

### IMPORTANT: Navigation Integration Approach

**Decision**: Implement navigation at the route level in the sessions route file rather than modifying SessionList component props. This approach:

- Avoids breaking existing SessionList interface
- Maintains component separation of concerns
- Provides clearer navigation context

```typescript
// In src/routes/servers/$serverId_.sessions.tsx
// Add "View Chat" link for each session
<Link to={`/servers/${serverId}/${session.id}/chat`}>
  <Button variant="outline" size="sm">
    View Chat
  </Button>
</Link>
```

### IMPORTANT: Hook Implementation Approach

**Decision**: Implement true stub with clear TODO documentation rather than partial SDK integration. This approach:

- Provides immediate functionality for UI development
- Clearly marks where real SDK integration is needed
- Maintains consistency with task requirements for read-only view

```typescript
// TODO: Replace with real OpenCode SDK integration
// Current implementation provides mock data for UI development
export function useSessionMessages(server: Server | null, sessionId: string) {
  // STUB: Return mock data for development
  // TODO: Implement actual client.session.messages(sessionId) call
  return {
    messages: mockMessages,
    isLoading: false,
    error: null,
    refetch: () => {},
  }
}
```

### CRITICAL: App-Wide Timestamp Strategy

**DECISION**: Standardize ALL timestamps to **milliseconds** throughout the application. This is a **CRITICAL** architectural decision that affects:

1. **Data Ingestion**: Normalize all timestamps to ms at the point of data entry
2. **Existing Components**: Update SessionList and any other components using timestamps
3. **New Components**: Use ms format consistently
4. **SDK Integration**: Convert SDK timestamps to ms if needed

```typescript
// STANDARD: All timestamps in milliseconds
const formattedTime = new Date(timestamp).toLocaleString()

// Data ingestion normalization
const normalizeTimestamp = (sdkTimestamp: number): number => {
  // TODO: Determine SDK timestamp units and convert to ms
  // If SDK returns seconds: return sdkTimestamp * 1000
  // If SDK returns ms: return sdkTimestamp
  return sdkTimestamp * 1000 // Assuming SDK returns seconds
}

// Update existing SessionList component
// TODO: Refactor SessionList to use ms timestamps consistently
```

**REQUIRED ACTIONS**:

- Update SessionList timestamp handling to use ms format
- Document timestamp standard in all relevant components
- Ensure all new components follow ms standard

### Error Handling Pattern

```typescript
// Consistent error states with existing pages
if (error) {
  return <ErrorCard error={error} onRetry={refetch} />
}

if (messages.length === 0) {
  return <EmptyState />
}
```

## Implementation Guidance

### Phase 1: Route Setup and Parameter Handling

1. **Create Route File**: Implement `src/routes/servers/$serverId_.$sessionId.chat.tsx`
2. **Parameter Extraction**: Use `Route.useParams()` for type-safe access to `serverId` and `sessionId`
3. **Server Validation**: Validate server exists using existing `useServers` hook
4. **Basic Layout**: Implement page structure with header and content areas

### Phase 2: Data Layer Implementation

1. **Hook Creation**: Implement `useSessionMessages` hook in `src/lib/opencode/hooks.ts` with stub implementation
2. **Client Integration**: Reuse existing OpenCode client creation pattern
3. **API Integration**: Prepare for `client.session.messages(sessionId)` call with TODO documentation
4. **Type Definitions**: Define TypeScript interfaces for message and part structures

### Phase 3: UI Component Development

1. **Message List Component**: Create container for displaying messages
2. **Message Card Component**: Individual message display with role and content
3. **Loading States**: Implement skeleton components for better UX
4. **Error States**: Handle API errors gracefully with retry functionality

### Phase 4: Navigation and Integration

1. **CRITICAL: BreadcrumbNav Updates**: Implement flat route detection and server name resolution with "Sessions" crumb
2. **Session List Links**: Add "View Chat" navigation links in sessions route file
3. **Route Type Safety**: Ensure all navigation is type-safe with TanStack Router
4. **CRITICAL: Timestamp Standardization**: Implement consistent ms timestamp formatting and update existing components

## Critical Decisions

### CRITICAL: Route Structure Decision

The flat file naming `$serverId_.$sessionId.chat.tsx` is critical for proper route matching. The underscore after `$serverId_` ensures the route is not nested under the servers layout while maintaining the correct URL structure.

### CRITICAL: BreadcrumbNav Flat Route Handling

The BreadcrumbNav component **MUST** be updated to detect and handle the flat route pattern `/servers/:serverId/:sessionId/chat` by parsing the pathname and resolving server names dynamically. This is **NOT OPTIONAL** - it is **REQUIRED** for proper navigation.

### CRITICAL: App-Wide Timestamp Standardization

All timestamp handling **MUST** be standardized to milliseconds throughout the application. This requires updating existing SessionList component and ensuring all new components follow the ms standard. This is a **CRITICAL** architectural decision for consistency.

### IMPORTANT: Navigation Integration Strategy

Implement navigation links at the route level in the sessions file rather than modifying SessionList component props to maintain clean component interfaces and separation of concerns.

### IMPORTANT: Hook Implementation Strategy

Use a true stub implementation with clear TODO documentation rather than partial SDK integration to provide immediate functionality while marking future integration points.

## Security Considerations

### Parameter Validation

- Validate `serverId` corresponds to an existing server
- Ensure `sessionId` is properly sanitized before API calls
- Handle cases where sessions don't exist or are inaccessible

### Data Exposure

- Only display read-only message content
- No input fields or send functionality to prevent unauthorized actions
- Consider access control if sessions have permission requirements

## Performance Considerations

### Message List Optimization

- Implement virtualization for large message lists (future enhancement)
- Use React Query caching to avoid redundant API calls
- Consider pagination if sessions can contain many messages

### Loading States

- Implement skeleton loading for better perceived performance
- Use React Query's background refetching for fresh data
- Optimize re-renders with proper memoization

## Maintainability Considerations

### Code Organization

- Follow existing file structure patterns
- Keep components modular and reusable
- Maintain consistent TypeScript interfaces

### Future Enhancements

- Design for potential future features like message search
- Consider adding message filtering capabilities
- Plan for potential real-time updates

This architectural analysis provides a comprehensive foundation for implementing the Session Chat Read-Only Route while maintaining consistency with existing patterns and ensuring scalability for future enhancements.
