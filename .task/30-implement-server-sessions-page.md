# Task: Implement Server Sessions Page

## Problem Statement

Each server in the application needs a dedicated page to display and manage its sessions. Currently, servers don't have unique identifiers and there's no way to view individual server sessions. Users need to be able to navigate to a specific server and see all sessions associated with that server.

## Requirements

1. Add an auto-incrementing identifier to each server (starting from 0)
2. Create a new route for individual server sessions page using TanStack Router
3. Display all sessions for a specific server
4. Integrate OpenCode SDK documentation from SST/opencode project using Context7
5. Follow TanStack Router patterns from `.github/instructions/` folder
6. Update server storage/types to include the identifier field
7. Ensure backward compatibility or migration for existing servers in localStorage
8. Use appropriate ShadCN UI components for the interface
9. Handle navigation from servers list to individual server sessions page

## Expected Outcome

- Each server has a unique auto-incremental identifier (starting from 0)
- Updated server data model with identifier field persisted in localStorage
- A functioning server sessions page accessible via TanStack Router with dynamic route parameter
- Clean UI showing list of sessions for the selected server
- Proper navigation from servers management page to individual server sessions
- Integration with OpenCode SDK documentation via Context7
- Responsive design consistent with the rest of the application
- Proper error handling for invalid server identifiers

## Implementation References

- Use documentation from `.github/instructions/` folder for TanStack Router implementation
- Reference `tanstack-react-router_routing.instructions.md` for dynamic route creation
- Reference `tanstack-react-router_setup-and-architecture.instructions.md` for page structure
- Use Context7 tool to fetch OpenCode SDK documentation from `sst/opencode` project
- Update `src/lib/servers/types.ts` to include identifier field
- Update `src/lib/servers/storage.ts` to handle identifier generation
- Use existing ShadCN components for UI consistency

## Additional Suggestions and Ideas

- Consider using route params like `/servers/:id/sessions` for the sessions page
- Implement a breadcrumb navigation showing: Servers > [Server Name] > Sessions
- Add empty state when no sessions are available for a server
- Consider adding session filtering/search functionality (future enhancement)
- Add session status indicators (active/inactive) if supported by OpenCode SDK
- Consider pagination or virtualization if session lists can be large
- Add ability to create new sessions from the server sessions page (future enhancement)
- Consider adding session details view (future enhancement)

## Other Important Agreements

- This is a TanStack Router project - follow routing patterns from documentation
- Server identifiers should be auto-incremental starting from 0
- Use localStorage for data persistence (no backend required)
- Use Context7 to access OpenCode SDK documentation from `sst/opencode` repository
- TanStack Router documentation is available in `.github/instructions` directory
- Maintain consistency with existing application architecture and styling
- Update tests for server storage and validation to include identifier field
