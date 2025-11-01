# Architecture Analysis: Servers Management Page

## Context Analysis

The task requires implementing a comprehensive Servers Management Page for the OpenCode UI application. This feature will enable users to manage OpenCode server configurations through a dedicated interface with full CRUD operations, validation, and persistent storage. The implementation must integrate seamlessly with the existing TanStack Router-based architecture and ShadCN UI component library.

### Current Architecture Context

- **Routing**: TanStack Router with file-based routing pattern
- **UI Framework**: React 19 with ShadCN UI components
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with custom design system
- **Validation**: Zod schema validation (already in dependencies)
- **Navigation**: Sidebar-based navigation with collapsible sections

### Key Requirements

- Create new `/servers` route following TanStack Router conventions
- Display server list with name and URL information
- Add server functionality with unique name validation
- URL format validation for server addresses
- localStorage persistence for server configurations
- Integration with existing sidebar navigation
- Responsive design consistent with application theme

## Technology Recommendations

### **IMPORTANT**: Routing Architecture Decision

**Recommended Approach**: File-Based Routing

- Rationale: The project already uses TanStack Router's file-based routing system
- Benefits: Automatic route tree generation, type safety, code splitting
- Implementation: Create `src/routes/servers.tsx` following existing patterns

### **IMPORTANT**: State Management Strategy

**Recommended Approach**: Custom Hook with localStorage Integration

- Rationale: Simple CRUD operations don't require TanStack Query's complexity
- Benefits: Direct localStorage access, React state synchronization, type safety
- Implementation: Custom `useServers()` hook with Zod validation

### **IMPORTANT**: Validation Framework

**Recommended Approach**: Zod Schema Validation

- Rationale: Zod is already in project dependencies and provides TypeScript-first validation
- Benefits: Runtime validation, type inference, error formatting
- Implementation: Server schema with name uniqueness and URL validation

### Form Management

**Recommended Approach**: React Hook Form with Zod integration

- Rationale: Superior performance, built-in validation handling, accessibility
- Benefits: Reduced re-renders, automatic validation, TypeScript support
- Alternative: Uncontrolled form with manual state management

### UI Component Strategy

**Recommended Approach**: ShadCN UI Components

- Dialog/Sheet: For add/edit server forms
- Button: Primary/secondary actions
- Input: Text input for server details
- Label: Form field labels
- Card/Skeleton: Server list display
- Dropdown Menu: Server actions (edit, delete)

## System Architecture

### Route Structure

```
src/routes/
├── __root.tsx (existing)
├── index.tsx (existing)
├── about.tsx (existing)
└── servers.tsx (new)
```

### Component Architecture

```
src/components/
├── layout/
│   └── app-sidebar.tsx (modify - add servers navigation)
├── servers/
│   ├── servers-list.tsx (new)
│   ├── server-card.tsx (new)
│   ├── server-form.tsx (new)
│   └── server-dialog.tsx (new)
└── ui/ (existing ShadCN components)
```

### Data Layer Architecture

```
src/lib/
├── navigation.ts (modify - add servers route)
├── servers/
│   ├── types.ts (new - server type definitions)
│   ├── storage.ts (new - localStorage operations)
│   ├── validation.ts (new - Zod schemas)
│   └── hooks.ts (new - useServers hook)
└── utils.ts (existing)
```

## Integration Patterns

### **IMPORTANT**: Navigation Integration Pattern

The servers page must integrate with the existing sidebar navigation system:

1. **Navigation Configuration Update**:

   ```typescript
   // src/lib/navigation.ts
   export const navigationConfig: NavSection[] = [
     // existing sections...
     {
       title: 'Configuration',
       items: [
         {
           title: 'Servers',
           to: '/servers',
           icon: Server, // Import from lucide-react
         },
       ],
     },
   ]
   ```

2. **Breadcrumb Integration**: The existing breadcrumb system will automatically handle the new route

### localStorage Persistence Pattern

Implement a robust localStorage abstraction with error handling:

1. **Storage Schema**: Versioned storage format for future migrations
2. **Error Handling**: Graceful fallback for storage failures
3. **Sync Strategy**: Real-time synchronization across browser tabs
4. **Type Safety**: Full TypeScript integration with Zod validation

### Form Validation Pattern

Implement comprehensive validation with user-friendly error messages:

1. **Schema Definition**: Zod schemas for server data
2. **Validation Triggers**: Real-time and submit-time validation
3. **Error Display**: Field-level and form-level error messages
4. **Accessibility**: Proper ARIA attributes for screen readers

## Implementation Guidance

### Phase 1: Core Infrastructure

1. **Create Route File**: `src/routes/servers.tsx` with basic component structure
2. **Update Navigation**: Add servers to sidebar navigation configuration
3. **Setup Data Layer**: Create types, validation schemas, and storage utilities
4. **Implement Custom Hook**: Create `useServers()` hook with CRUD operations

### Phase 2: UI Components

1. **Server List Component**: Display servers with empty state handling
2. **Server Card Component**: Individual server display with actions
3. **Add Server Form**: Form component with validation
4. **Dialog Integration**: Modal/Sheet for add/edit operations

### Phase 3: Advanced Features

1. **Edit Functionality**: Modify existing server configurations
2. **Delete Operations**: Remove servers with confirmation
3. **Error Boundaries**: Handle storage and validation errors gracefully
4. **Loading States**: Skeleton components and optimistic updates

### **IMPORTANT**: Critical Implementation Decisions

#### Data Structure

```typescript
interface Server {
  id: string
  name: string // Must be unique
  url: string // Must be valid URL
  createdAt: Date
  updatedAt: Date
}
```

#### Validation Schema

```typescript
const serverSchema = z.object({
  name: z
    .string()
    .min(1, 'Server name is required')
    .max(50, 'Server name must be less than 50 characters'),
  url: z
    .string()
    .url('Please enter a valid URL')
    .min(1, 'Server URL is required'),
})
```

#### Storage Key Strategy

- Use namespaced key: `opencode-ui.servers.v1`
- Include version for future migrations
- Implement JSON serialization with error handling

#### Error Handling Strategy

- Validation errors: Display inline with form fields
- Storage errors: Show toast notifications with retry options
- Network errors: Graceful degradation with cached data

## Security Considerations

### Input Validation

- **IMPORTANT**: Sanitize all user inputs before storage
- URL validation to prevent XSS attacks
- Name length limits to prevent storage bloat

### Data Persistence

- localStorage is limited to same-origin access
- Consider data encryption for sensitive server URLs
- Implement data export/import functionality for backup

### Accessibility

- Keyboard navigation for all interactive elements
- Screen reader compatibility for form validation
- High contrast support for error states

## Performance Considerations

### Component Optimization

- Use React.memo for server card components
- Implement virtual scrolling for large server lists
- Debounce search/filter operations

### Storage Optimization

- Implement lazy loading for server data
- Use efficient JSON serialization
- Consider compression for large datasets

### Bundle Size

- Lazy load server management components
- Tree-shake unused Zod validation rules
- Optimize ShadCN component imports

## Testing Strategy

### Unit Tests

- Validation schema testing with edge cases
- Storage utility function testing
- Custom hook behavior testing

### Integration Tests

- Form submission and validation flow
- localStorage persistence across sessions
- Navigation and routing integration

### Accessibility Tests

- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation

## Future Extensibility

### Scalability Considerations

- Design for future server grouping/categorization
- Plan for server health checking functionality
- Architecture support for server templates

### Migration Path

- Versioned storage schema for data migrations
- Plugin architecture for custom validation rules
- API integration preparation for future backend sync

This architecture provides a solid foundation for the Servers Management Page while maintaining consistency with the existing application structure and following modern React development best practices.
