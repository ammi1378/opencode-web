# Implementation Plan: Servers Management Page

## Implementation Overview

This plan details the step-by-step implementation of the Servers Management Page for OpenCode UI. The feature enables users to manage server configurations through a dedicated interface with full CRUD operations, validation, and localStorage persistence. The implementation follows TanStack Router conventions and uses ShadCN UI components.

**Key Implementation Points:**

- File-based routing pattern with TanStack Router
- Custom React hook for state management and localStorage integration
- Zod schema validation for runtime type safety
- ShadCN UI components for consistent design
- Responsive layout with empty states and loading indicators

---

## Component Details

### 1. Route Component

**File:** `src/routes/servers.tsx`

**Purpose:** Main route component that orchestrates the servers management page

**Structure:**

```typescript
export const Route = createFileRoute('/servers')({
  component: ServersPage,
})

function ServersPage() {
  const { servers, isLoading, addServer, updateServer, deleteServer } =
    useServers()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)

  // Component renders ServersList and ServerDialog
}
```

**Key Features:**

- Breadcrumb integration (automatic via TanStack Router)
- Server list display with empty state
- Add/edit server dialog management
- Loading state handling

---

### 2. Server List Component

**File:** `src/components/servers/servers-list.tsx`

**Purpose:** Display grid/list of server cards with empty state

**Props Interface:**

```typescript
interface ServersListProps {
  servers: Server[]
  onEdit: (server: Server) => void
  onDelete: (serverId: string) => void
  isLoading?: boolean
}
```

**Layout Pattern:**

- Grid layout on desktop (2-3 columns)
- Single column on mobile
- Skeleton loading state (3-4 skeleton cards)
- Empty state with illustration and "Add Server" CTA

**ShadCN Components:**

- Skeleton for loading state
- Card for empty state container

---

### 3. Server Card Component

**File:** `src/components/servers/server-card.tsx`

**Purpose:** Individual server display with action menu

**Props Interface:**

```typescript
interface ServerCardProps {
  server: Server
  onEdit: (server: Server) => void
  onDelete: (serverId: string) => void
}
```

**Visual Design:**

- Server icon (from lucide-react)
- Server name (heading)
- Server URL (muted text with copy button)
- Dropdown menu for actions (edit, delete)
- Created/updated timestamp (optional)

**ShadCN Components:**

- Card (or custom div with border)
- Button (for actions)
- DropdownMenu (edit, delete options)
- Tooltip (for copy URL button)

---

### 4. Server Dialog Component

**File:** `src/components/servers/server-dialog.tsx`

**Purpose:** Modal container for add/edit server form

**Props Interface:**

```typescript
interface ServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server?: Server
  onSubmit: (data: ServerFormData) => Promise<void>
  existingServers: Server[]
}
```

**Behavior:**

- Modal opens for both add and edit modes
- Title changes based on mode ("Add Server" vs "Edit Server")
- Form submission triggers onSubmit callback
- Closes on successful submission
- Resets form on close

**ShadCN Components:**

- Dialog (or Sheet for mobile-friendly UI)
- Button (submit, cancel)

---

### 5. Server Form Component

**File:** `src/components/servers/server-form.tsx`

**Purpose:** Form for creating/editing server with validation

**Props Interface:**

```typescript
interface ServerFormProps {
  defaultValues?: Partial<ServerFormData>
  onSubmit: (data: ServerFormData) => Promise<void>
  existingServers: Server[]
  mode: 'add' | 'edit'
}
```

**Form Fields:**

1. **Name Field:**
   - Text input
   - Required, 1-50 characters
   - Unique validation against existing servers
   - Real-time validation feedback

2. **URL Field:**
   - Text input
   - Required, valid URL format
   - Placeholder: "https://api.opencode.dev"
   - URL validation with Zod

**Validation Flow:**

- Inline validation on blur
- Full validation on submit
- Display field-level errors
- Disable submit while validating

**ShadCN Components:**

- Label
- Input
- Button

**Form State Management:**

- Controlled form with React state
- Or React Hook Form with zodResolver

---

## Data Structures

### Server Type Definition

**File:** `src/lib/servers/types.ts`

```typescript
export interface Server {
  id: string
  name: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface ServerFormData {
  name: string
  url: string
}

export interface ServersStorage {
  version: number
  servers: Server[]
}
```

**Type Design Decisions:**

- `id`: UUID v4 generated with `crypto.randomUUID()`
- `name`: User-friendly identifier, max 50 chars
- `url`: Full URL including protocol
- Timestamps as ISO 8601 strings for serialization
- Separate `ServerFormData` for form handling

---

### Validation Schema

**File:** `src/lib/servers/validation.ts`

```typescript
import { z } from 'zod'

export const serverFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Server name is required')
    .max(50, 'Server name must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Server name can only contain letters, numbers, spaces, hyphens, and underscores',
    ),
  url: z
    .string()
    .min(1, 'Server URL is required')
    .url('Please enter a valid URL (e.g., https://api.example.com)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://',
    ),
})

export type ServerFormData = z.infer<typeof serverFormSchema>

export function validateUniqueServerName(
  name: string,
  existingServers: Server[],
  currentServerId?: string,
): boolean {
  return !existingServers.some(
    (server) =>
      server.name.toLowerCase() === name.toLowerCase() &&
      server.id !== currentServerId,
  )
}
```

**Validation Rules:**

- Name: Required, 1-50 chars, alphanumeric with limited special chars
- URL: Required, valid URL format, must include protocol
- Unique name validation performed separately (context-dependent)

---

## API Design (Hooks & Utilities)

### localStorage Storage Utility

**File:** `src/lib/servers/storage.ts`

```typescript
const STORAGE_KEY = 'opencode-ui.servers.v1'
const STORAGE_VERSION = 1

export const serversStorage = {
  get(): Server[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const parsed: ServersStorage = JSON.parse(data)

      if (parsed.version !== STORAGE_VERSION) {
        return migrateServersData(parsed)
      }

      return parsed.servers
    } catch (error) {
      console.error('Failed to load servers from localStorage:', error)
      return []
    }
  },

  set(servers: Server[]): void {
    try {
      const data: ServersStorage = {
        version: STORAGE_VERSION,
        servers,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save servers to localStorage:', error)
      throw new Error('Failed to save server configuration')
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear servers from localStorage:', error)
    }
  },
}

function migrateServersData(data: ServersStorage): Server[] {
  // Future migration logic for schema changes
  return data.servers
}
```

**Key Features:**

- Versioned storage for future migrations
- Error handling with fallback to empty array
- Type-safe JSON serialization
- Migration support for schema changes

---

### useServers Custom Hook

**File:** `src/lib/servers/hooks.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { serversStorage } from './storage'
import { serverFormSchema, validateUniqueServerName } from './validation'
import type { Server, ServerFormData } from './types'

export function useServers() {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadServers = () => {
      const loadedServers = serversStorage.get()
      setServers(loadedServers)
      setIsLoading(false)
    }

    loadServers()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'opencode-ui.servers.v1') {
        loadServers()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addServer = useCallback(
    async (formData: ServerFormData): Promise<void> => {
      const validated = serverFormSchema.parse(formData)

      if (!validateUniqueServerName(validated.name, servers)) {
        throw new Error('A server with this name already exists')
      }

      const newServer: Server = {
        id: crypto.randomUUID(),
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

  const updateServer = useCallback(
    async (serverId: string, formData: ServerFormData): Promise<void> => {
      const validated = serverFormSchema.parse(formData)

      if (!validateUniqueServerName(validated.name, servers, serverId)) {
        throw new Error('A server with this name already exists')
      }

      const updatedServers = servers.map((server) =>
        server.id === serverId
          ? {
              ...server,
              name: validated.name,
              url: validated.url,
              updatedAt: new Date().toISOString(),
            }
          : server,
      )

      serversStorage.set(updatedServers)
      setServers(updatedServers)
    },
    [servers],
  )

  const deleteServer = useCallback(
    async (serverId: string): Promise<void> => {
      const updatedServers = servers.filter((server) => server.id !== serverId)
      serversStorage.set(updatedServers)
      setServers(updatedServers)
    },
    [servers],
  )

  return {
    servers,
    isLoading,
    addServer,
    updateServer,
    deleteServer,
  }
}
```

**Hook Features:**

- Initial load from localStorage
- Cross-tab synchronization via storage event
- CRUD operations with validation
- Error handling with descriptive messages
- Optimistic UI updates

---

## Navigation Integration

### Update Navigation Configuration

**File:** `src/lib/navigation.ts`

**Changes Required:**

1. Import Server icon from lucide-react
2. Add new navigation section or item for Servers

**Example Addition:**

```typescript
import { Server /* other icons */ } from 'lucide-react'

export const navigationConfig: NavSection[] = [
  // Existing sections...
  {
    title: 'Configuration',
    items: [
      {
        title: 'Servers',
        to: '/servers',
        icon: Server,
      },
    ],
  },
]
```

**Integration Points:**

- Sidebar navigation automatically updated
- Breadcrumb navigation handles new route
- Active state highlighting via TanStack Router

---

## Testing Strategy

### Unit Tests

**Test Files:**

- `src/lib/servers/validation.test.ts`
- `src/lib/servers/storage.test.ts`
- `src/lib/servers/hooks.test.ts`

**Validation Tests:**

```typescript
describe('serverFormSchema', () => {
  it('should validate correct server data', () => {
    const valid = serverFormSchema.parse({
      name: 'Production Server',
      url: 'https://api.example.com',
    })
    expect(valid).toBeDefined()
  })

  it('should reject invalid URLs', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'Test',
        url: 'not-a-url',
      }),
    ).toThrow()
  })

  it('should reject names over 50 characters', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'a'.repeat(51),
        url: 'https://example.com',
      }),
    ).toThrow()
  })
})

describe('validateUniqueServerName', () => {
  it('should return false for duplicate names (case-insensitive)', () => {
    const servers = [
      {
        id: '1',
        name: 'Production',
        url: 'https://example.com',
        createdAt: '',
        updatedAt: '',
      },
    ]
    expect(validateUniqueServerName('production', servers)).toBe(false)
  })

  it('should allow same name when editing same server', () => {
    const servers = [
      {
        id: '1',
        name: 'Production',
        url: 'https://example.com',
        createdAt: '',
        updatedAt: '',
      },
    ]
    expect(validateUniqueServerName('Production', servers, '1')).toBe(true)
  })
})
```

**Storage Tests:**

```typescript
describe('serversStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return empty array when no data exists', () => {
    expect(serversStorage.get()).toEqual([])
  })

  it('should save and retrieve servers', () => {
    const servers = [
      {
        id: '1',
        name: 'Test Server',
        url: 'https://test.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    serversStorage.set(servers)
    expect(serversStorage.get()).toEqual(servers)
  })

  it('should handle corrupted data gracefully', () => {
    localStorage.setItem('opencode-ui.servers.v1', 'invalid json')
    expect(serversStorage.get()).toEqual([])
  })
})
```

**Hook Tests (React Testing Library):**

```typescript
describe('useServers', () => {
  it('should load servers from storage on mount', async () => {
    const { result } = renderHook(() => useServers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('should add a new server', async () => {
    const { result } = renderHook(() => useServers())

    await act(async () => {
      await result.current.addServer({
        name: 'New Server',
        url: 'https://new.com',
      })
    })

    expect(result.current.servers).toHaveLength(1)
    expect(result.current.servers[0].name).toBe('New Server')
  })

  it('should throw error for duplicate server name', async () => {
    const { result } = renderHook(() => useServers())

    await act(async () => {
      await result.current.addServer({
        name: 'Server',
        url: 'https://one.com',
      })
    })

    await expect(
      result.current.addServer({
        name: 'Server',
        url: 'https://two.com',
      }),
    ).rejects.toThrow('A server with this name already exists')
  })
})
```

---

### Integration Tests

**Test Scenarios:**

1. **Full Add Server Flow:**
   - Open servers page
   - Click "Add Server" button
   - Fill form with valid data
   - Submit form
   - Verify server appears in list
   - Verify persistence (reload page)

2. **Edit Server Flow:**
   - Navigate to servers page
   - Click edit on existing server
   - Modify server details
   - Submit changes
   - Verify updates appear

3. **Delete Server Flow:**
   - Navigate to servers page
   - Click delete on server
   - Verify server removed from list
   - Verify localStorage updated

4. **Validation Error Handling:**
   - Attempt to add server with duplicate name
   - Verify error message displayed
   - Attempt to add server with invalid URL
   - Verify error message displayed

---

### Accessibility Tests

**Areas to Test:**

1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Escape to close dialog
   - Arrow keys in dropdown menu

2. **Screen Reader:**
   - Form labels properly associated
   - Error messages announced
   - Button purposes clear
   - Loading states communicated

3. **Color Contrast:**
   - Error messages meet WCAG AA standards
   - Button states distinguishable
   - Focus indicators visible

**Automated Testing:**

```typescript
import { axe } from 'jest-axe'

describe('Servers Page Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ServersPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## Development Phases

### Phase 1: Foundation Setup (Day 1, ~2-3 hours)

**Objective:** Establish core infrastructure and data layer

**Tasks:**

1. Create data structures and types
   - [ ] Create `src/lib/servers/types.ts` with Server and ServerFormData interfaces
   - [ ] Export types for use across components

2. Implement validation schemas
   - [ ] Create `src/lib/servers/validation.ts`
   - [ ] Define serverFormSchema with Zod
   - [ ] Implement validateUniqueServerName function
   - [ ] Add unit tests for validation logic

3. Build localStorage utilities
   - [ ] Create `src/lib/servers/storage.ts`
   - [ ] Implement serversStorage.get() with error handling
   - [ ] Implement serversStorage.set() with versioning
   - [ ] Add unit tests for storage operations

4. Create custom hook
   - [ ] Create `src/lib/servers/hooks.ts`
   - [ ] Implement useServers hook with CRUD operations
   - [ ] Add cross-tab synchronization
   - [ ] Add unit tests for hook behavior

**Deliverables:**

- ✅ Complete data layer with types, validation, storage, and hooks
- ✅ Test coverage for all utilities
- ✅ Documentation comments in code

**Verification:**

- Run `npm run typecheck` - no errors
- Run tests - all passing
- Manual localStorage inspection works

---

### Phase 2: Core UI Components (Day 2, ~3-4 hours)

**Objective:** Build reusable UI components for server management

**Tasks:**

1. Create server form component
   - [ ] Create `src/components/servers/server-form.tsx`
   - [ ] Implement form with name and URL fields
   - [ ] Add inline validation with Zod
   - [ ] Handle form submission
   - [ ] Add loading and error states

2. Create server dialog component
   - [ ] Create `src/components/servers/server-dialog.tsx`
   - [ ] Integrate ShadCN Dialog or Sheet
   - [ ] Connect to server form
   - [ ] Handle open/close states
   - [ ] Support add/edit modes

3. Create server card component
   - [ ] Create `src/components/servers/server-card.tsx`
   - [ ] Display server name and URL
   - [ ] Add action dropdown menu (edit, delete)
   - [ ] Add copy URL functionality
   - [ ] Implement responsive design

4. Create server list component
   - [ ] Create `src/components/servers/servers-list.tsx`
   - [ ] Implement grid layout (responsive)
   - [ ] Add empty state UI
   - [ ] Add skeleton loading state
   - [ ] Connect with server cards

**Deliverables:**

- ✅ Four reusable components with proper props interfaces
- ✅ Consistent styling with ShadCN theme
- ✅ Responsive design for mobile/desktop

**Verification:**

- Component renders in Storybook/isolation
- All props work as expected
- Responsive layout works on mobile

---

### Phase 3: Route Integration (Day 2-3, ~2 hours)

**Objective:** Create servers route and integrate with navigation

**Tasks:**

1. Create servers route
   - [ ] Create `src/routes/servers.tsx`
   - [ ] Define route with createFileRoute
   - [ ] Implement ServersPage component
   - [ ] Connect useServers hook
   - [ ] Integrate all UI components

2. Update navigation configuration
   - [ ] Modify `src/lib/navigation.ts`
   - [ ] Add Servers navigation item with icon
   - [ ] Add to appropriate navigation section
   - [ ] Verify route tree regeneration

3. Handle page states
   - [ ] Implement loading state
   - [ ] Implement empty state
   - [ ] Implement error boundaries
   - [ ] Add success/error toast notifications

**Deliverables:**

- ✅ Functioning /servers route
- ✅ Navigation integration complete
- ✅ All page states handled

**Verification:**

- Navigate to /servers in browser
- Breadcrumbs show correct path
- Sidebar highlights active route
- Route tree updated automatically

---

### Phase 4: Advanced Features (Day 3, ~2-3 hours)

**Objective:** Implement edit, delete, and polish features

**Tasks:**

1. Implement edit functionality
   - [ ] Add edit button to server card
   - [ ] Populate form with existing server data
   - [ ] Handle update submission
   - [ ] Verify unique name validation (excluding current server)

2. Implement delete functionality
   - [ ] Add delete button to server card
   - [ ] Add confirmation dialog
   - [ ] Handle delete operation
   - [ ] Show success notification

3. Add copy URL functionality
   - [ ] Add copy button next to URL
   - [ ] Implement clipboard API
   - [ ] Show tooltip on success
   - [ ] Handle copy errors gracefully

4. Error handling and UX polish
   - [ ] Add toast notifications for all operations
   - [ ] Improve error messages
   - [ ] Add loading indicators
   - [ ] Handle edge cases (storage full, etc.)

**Deliverables:**

- ✅ Full CRUD operations working
- ✅ User feedback for all actions
- ✅ Polished error handling

**Verification:**

- Edit existing server successfully
- Delete server with confirmation
- Copy URL to clipboard
- All error states display correctly

---

### Phase 5: Testing & Documentation (Day 4, ~2-3 hours)

**Objective:** Ensure quality through comprehensive testing

**Tasks:**

1. Unit testing
   - [ ] Write tests for validation schemas
   - [ ] Write tests for storage utilities
   - [ ] Write tests for useServers hook
   - [ ] Achieve >80% code coverage

2. Integration testing
   - [ ] Test full add server flow
   - [ ] Test edit server flow
   - [ ] Test delete server flow
   - [ ] Test validation error handling

3. Accessibility testing
   - [ ] Run axe accessibility tests
   - [ ] Manual keyboard navigation testing
   - [ ] Screen reader compatibility check
   - [ ] Color contrast validation

4. Documentation
   - [ ] Add JSDoc comments to all functions
   - [ ] Update README if needed
   - [ ] Document localStorage schema
   - [ ] Add usage examples in comments

**Deliverables:**

- ✅ Comprehensive test suite
- ✅ Accessibility compliance verified
- ✅ Code documentation complete

**Verification:**

- Run `npm test` - all tests pass
- Run `npm run lint` - no errors
- Run `npm run typecheck` - no errors
- Accessibility audit passes

---

### Phase 6: Final Polish & Review (Day 4, ~1-2 hours)

**Objective:** Final review and optimization

**Tasks:**

1. Performance optimization
   - [ ] Check bundle size impact
   - [ ] Verify lazy loading works
   - [ ] Test with large datasets (50+ servers)
   - [ ] Optimize re-renders if needed

2. Cross-browser testing
   - [ ] Test in Chrome/Edge
   - [ ] Test in Firefox
   - [ ] Test in Safari
   - [ ] Verify localStorage compatibility

3. Mobile responsiveness
   - [ ] Test on small screens (<375px)
   - [ ] Test on tablets (768px-1024px)
   - [ ] Verify touch interactions
   - [ ] Test dialog/sheet behavior

4. Final review
   - [ ] Code review checklist
   - [ ] Security review (input sanitization)
   - [ ] UX review (user flows)
   - [ ] Documentation review

**Deliverables:**

- ✅ Production-ready feature
- ✅ Cross-browser compatibility verified
- ✅ Performance optimized

**Verification:**

- Feature works in all supported browsers
- Mobile experience is smooth
- No console errors or warnings
- Code passes team review standards

---

## Summary

This implementation plan provides a comprehensive, step-by-step approach to building the Servers Management Page. The plan follows a logical progression from foundation to polish, with clear deliverables and verification steps at each phase.

**Total Estimated Time:** 12-16 hours across 4 days

**Key Success Metrics:**

- All CRUD operations functional
- Data persists across sessions
- Full validation working
- > 80% test coverage
- Accessibility compliant
- Responsive design
- Zero TypeScript errors

**Next Steps:**

1. Review this plan with team/stakeholders
2. Set up development environment
3. Begin Phase 1: Foundation Setup
4. Follow phases sequentially with verification steps
