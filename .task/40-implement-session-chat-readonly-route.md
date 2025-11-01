# Task: Implement Session Chat Read-Only Route

## Problem Statement

Users need a read-only view to inspect messages of a given session. The application currently lacks a route for per-session chat content and a UI dedicated to displaying messages. We must add a new route with `serverId` and `sessionId` params, at the path `/servers/:serverId/:sessionId/chat`, that renders session messages without any input or message-sending functionality.

## Requirements

1. Add TanStack Router route for path `/servers/:serverId/:sessionId/chat`
2. Use `sessionId` as a route param alongside `serverId`
3. File-based routing:
   - Create route file: `src/routes/servers/$serverId_.$sessionId.chat.tsx`
   - Base follows pattern `$serverId_.$sessionId` inside `servers` folder
4. UI shows only the list of messages (read-only). No input box, no send actions
5. Use ShadCN UI components already present (e.g., `card`, `separator`, `skeleton`) for layout and loading states
6. Data layer:
   - Prepare a React Query-powered hook for fetching session messages via the OpenCode SDK
   - For now, add a placeholder/stub fetching function with clear TODO to integrate the SDK later
7. Navigation:
   - From server sessions page (`/servers/:serverId/sessions`), link entries to the new chat route
   - Add breadcrumb updates consistent with existing navigation patterns
8. Follow `.github/instructions` TanStack Router guides and use Context7 MCP for OpenCode (sst/opencode) references
9. Handle basic error states (invalid `serverId`/`sessionId`, empty messages)

## Expected Outcome

- Navigable route at `/servers/:serverId/:sessionId/chat` that displays session messages only
- File-based route aligned with current project conventions and user request
- Read-only UI with clean, responsive ShadCN-based layout
- React Query hook scaffolded for future OpenCode SDK integration
- Links from sessions listing to this chat view function correctly
- Clear handling of loading, empty, and error states

## Implementation References

- TanStack Router docs in `.github/instructions/`:
  - `tanstack-react-router_setup-and-architecture.instructions.md`
  - `tanstack-react-router_routing.instructions.md`
  - `tanstack-react-router_api.instructions.md`
  - `tanstack-react-router_guide.instructions.md`
- Use Context7 MCP to consult `sst/opencode` API details for message retrieval patterns
- Mirror existing route naming conventions (e.g., `src/routes/servers/$serverId_.sessions.tsx`) to remain consistent
- Use existing ShadCN components for UI consistency

## Additional Suggestions and Ideas

- Use flat file pattern: `src/routes/servers/$serverId_.$sessionId.chat.tsx` to directly encode `/chat`
- Add `Skeleton` placeholders for loading and an empty state when no messages exist
- Consider a simple "Back to Sessions" link or breadcrumb trail
- Add message timestamps and sender information if available from OpenCode SDK
- Consider grouping messages by date/time for better readability
- Add scroll-to-bottom functionality for long message lists
- Consider virtualization if message lists can be very long (future enhancement)

## Other Important Agreements

- Routing framework: TanStack Router with file-based routing
- UI: ShadCN components, consistent with existing styles
- Knowledge base: Context7 MCP for `sst/opencode` documentation
- Data fetching: Use React Query for OpenCode SDK calls; SDK integration will be added later
- Keep naming consistent with existing `servers` route files
- Use flat-file `.chat.tsx` naming to satisfy the `/chat` segment requirement
- This is read-only chat view - no message sending functionality at this stage
