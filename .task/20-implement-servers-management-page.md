# Task: Implement Servers Management Page

## Problem Statement

The application needs a dedicated page for managing OpenCode servers. Users should be able to view a list of their configured servers, add new servers, and have this data persisted across sessions. Currently, there is no server management functionality in the application.

## Requirements

1. Create a new "Servers" page/route in the TanStack Router application
2. Display a list of OpenCode servers with their name and address (URL)
3. Implement functionality to add new servers with:
   - Unique server name (validation required)
   - Server address (URL format)
4. Persist server data to browser localStorage
5. Follow TanStack Router patterns and conventions from `.github/instructions/` folder
6. Use appropriate ShadCN UI components for the interface
7. Ensure proper form validation for server creation
8. Handle duplicate server names gracefully

## Expected Outcome

- A functioning servers management page accessible via TanStack Router
- Clean UI showing list of configured servers
- Form/modal to add new servers with name and URL fields
- Data persistence using localStorage
- Proper validation and error handling
- Integration with the existing sidebar navigation
- Responsive design consistent with the rest of the application

## Implementation References

- Use documentation from `.github/instructions/` folder for TanStack Router implementation
- Reference `tanstack-react-router_routing.instructions.md` for route creation
- Reference `tanstack-react-router_setup-and-architecture.instructions.md` for page structure
- Use existing ShadCN components (button, input, label, etc.) for UI
- Follow patterns from existing routes like `src/routes/about.tsx` and `src/routes/index.tsx`

## Additional Suggestions and Ideas

- Consider using ShadCN's Sheet or Dialog component for the add server form
- Implement edit and delete functionality for existing servers
- Add server status/health check indicators (optional for future enhancement)
- Consider adding server URL validation (proper URL format)
- Show empty state when no servers are configured
- Add confirmation dialog when deleting servers (future enhancement)
- Consider exporting/importing server configurations (future enhancement)

## Other Important Agreements

- This is a TanStack Router project - follow routing patterns from documentation
- Use localStorage for data persistence (no backend required)
- Server names must be unique
- Server addresses should be valid URLs
- Use existing ShadCN UI components already installed in the project
- Maintain consistency with existing application architecture and styling
