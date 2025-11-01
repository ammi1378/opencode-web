# Implementation Plan: ShadCN Sidebar Layout Integration

## Implementation Overview

This plan details the step-by-step implementation of ShadCN's sidebar-02 component (sidebar with collapsible sections) into the TanStack Router application. The implementation will replace the current Header-based layout with a comprehensive sidebar navigation system that serves as the main application shell.

**Core Objective**: Integrate a fully functional, responsive sidebar layout that works seamlessly with TanStack Router's file-based routing system while maintaining type safety and following established patterns.

**Implementation Approach**:

1. Install ShadCN sidebar-02 component and dependencies via ShadCN MCP
2. Create navigation configuration with type-safe route definitions
3. Build custom layout components that wrap ShadCN primitives
4. Modify root route to integrate sidebar layout
5. Implement responsive behavior and mobile navigation
6. Test integration across devices and routes

**Key Principles**:

- Use existing technologies - no new dependencies beyond ShadCN components
- Maintain TanStack Router's type safety and patterns
- Follow ShadCN component conventions
- Preserve existing integrations (TanStack Query, DevTools)
- Ensure responsive design across all screen sizes

---

## Component Details

### Sidebar Component Structure

The sidebar-02 implementation will consist of several layers:

#### 1. ShadCN Base Components (Auto-generated)

Installed via ShadCN MCP:

- `SidebarProvider` - Context provider for sidebar state
- `Sidebar` - Main sidebar container
- `SidebarInset` - Content area wrapper
- `SidebarTrigger` - Toggle button for sidebar visibility
- `SidebarHeader` - Sidebar header section
- `SidebarContent` - Main scrollable content area
- `SidebarFooter` - Sidebar footer section
- `SidebarGroup` - Grouping container for navigation items
- `SidebarMenu` - Menu list container
- `SidebarMenuItem` - Individual menu item wrapper
- `SidebarMenuButton` - Clickable menu button
- `SidebarRail` - Visual rail for collapsed state
- `Collapsible` - Collapsible section wrapper
- `CollapsibleTrigger` - Trigger for collapsible sections
- `CollapsibleContent` - Collapsible content container

#### 2. Custom Layout Components

**AppSidebar Component** (`src/components/layout/app-sidebar.tsx`)

Main sidebar component structure:

```tsx
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* App branding/logo */}
        {/* Optional search form */}
      </SidebarHeader>

      <SidebarContent>
        {/* Collapsible navigation groups */}
        {navigationConfig.map((section) => (
          <CollapsibleNavSection key={section.title} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter>{/* User menu or additional actions */}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
```

**SidebarHeader Component** (`src/components/layout/sidebar-header.tsx`)

Header section with app branding:

```tsx
export function SidebarHeaderContent() {
  return (
    <div className="flex items-center gap-2 px-2 py-2">
      {/* App logo/icon */}
      <div className="flex flex-1 flex-col">
        <span className="font-semibold">OpenCode UI</span>
        <span className="text-xs text-muted-foreground">v1.0.0</span>
      </div>
    </div>
  )
}
```

**CollapsibleNavSection Component** (`src/components/layout/nav-section.tsx`)

Collapsible navigation section:

```tsx
interface CollapsibleNavSectionProps {
  section: NavSection
}

export function CollapsibleNavSection({ section }: CollapsibleNavSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenu>
            {section.items.map((item) => (
              <NavMenuItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
```

**NavMenuItem Component** (`src/components/layout/nav-item.tsx`)

Individual navigation item with TanStack Router Link integration:

```tsx
interface NavMenuItemProps {
  item: NavItem
}

export function NavMenuItem({ item }: NavMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          to={item.to}
          activeProps={{
            className: 'bg-sidebar-accent text-sidebar-accent-foreground',
          }}
          inactiveProps={{
            className: '',
          }}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
```

**BreadcrumbNav Component** (`src/components/layout/breadcrumb-nav.tsx`)

Dynamic breadcrumbs based on current route:

```tsx
export function BreadcrumbNav() {
  const matches = useMatches()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {matches
          .filter((match) => match.pathname !== '/')
          .map((match, index, array) => (
            <React.Fragment key={match.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === array.length - 1 ? (
                  <BreadcrumbPage>
                    {match.context.title || 'Page'}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink to={match.pathname}>
                    {match.context.title || 'Page'}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### Navigation Items Configuration

Navigation structure will be defined in a centralized configuration file with type-safe route references.

**Navigation Item Types**:

- **Link items** - Direct navigation to a route
- **Collapsible sections** - Grouped navigation items
- **Nested items** - Sub-navigation within sections (future enhancement)

**Example Navigation Structure**:

```
Getting Started
  ├─ Home
  └─ About

Features
  ├─ TanStack Query Demo
  └─ Components (future)

Documentation (future)
  └─ API Reference
```

---

## Data Structures

### Navigation Configuration Schema

**File**: `src/lib/navigation.ts`

```tsx
import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  to: LinkProps['to']
  icon?: LucideIcon
  badge?: string
  items?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigationConfig: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Home',
        to: '/',
        icon: Home,
      },
      {
        title: 'About',
        to: '/about',
        icon: Info,
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        title: 'TanStack Query Demo',
        to: '/demo/tanstack-query',
        icon: Database,
      },
    ],
  },
]
```

### Route Context Extension

Extend router context to include navigation configuration (optional):

```tsx
interface MyRouterContext {
  queryClient: QueryClient
  navigationConfig?: NavSection[]
}
```

This allows routes to access navigation configuration if needed for breadcrumbs or page titles.

### Sidebar State Management

ShadCN sidebar uses internal state management via context. Key state properties:

- `open` - Boolean indicating sidebar visibility
- `onOpenChange` - Callback for state changes
- `defaultOpen` - Initial open state

State persistence can be added via localStorage:

```tsx
const [open, setOpen] = useState(() => {
  const stored = localStorage.getItem('sidebar:state')
  return stored ? JSON.parse(stored) : true
})

useEffect(() => {
  localStorage.setItem('sidebar:state', JSON.stringify(open))
}, [open])
```

---

## API Design

### Navigation API

**Type-Safe Navigation Helper**:

```tsx
import { useNavigate } from '@tanstack/react-router'

export function useTypedNavigate() {
  return useNavigate()
}
```

TanStack Router already provides type-safe navigation. No additional API needed.

### Sidebar Control API (Optional)

For programmatic sidebar control:

```tsx
import { useSidebar } from '@/components/ui/sidebar'

export function useSidebarControl() {
  const { open, setOpen, toggleSidebar } = useSidebar()

  return {
    isOpen: open,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: toggleSidebar,
  }
}
```

### Active Route Detection

TanStack Router's `Link` component provides built-in active route detection via `activeProps`. No additional API needed.

```tsx
<Link
  to="/posts"
  activeProps={{ className: 'active-link' }}
  activeOptions={{ exact: false }}
>
  Posts
</Link>
```

---

## Testing Strategy

### Component Testing

**Test Focus**: Individual component rendering and behavior

**AppSidebar Tests** (`src/components/layout/app-sidebar.test.tsx`):

```tsx
describe('AppSidebar', () => {
  it('renders all navigation sections', () => {
    // Verify all sections from navigationConfig are rendered
  })

  it('renders navigation items within sections', () => {
    // Verify navigation items are rendered
  })

  it('applies correct structure and styling', () => {
    // Verify DOM structure matches expected hierarchy
  })
})
```

**NavMenuItem Tests** (`src/components/layout/nav-item.test.tsx`):

```tsx
describe('NavMenuItem', () => {
  it('renders navigation link with correct props', () => {
    // Verify Link component receives correct to prop
  })

  it('renders icon when provided', () => {
    // Verify icon renders
  })

  it('applies active styles when route matches', () => {
    // Mock router context and verify active styling
  })
})
```

**CollapsibleNavSection Tests** (`src/components/layout/nav-section.test.tsx`):

```tsx
describe('CollapsibleNavSection', () => {
  it('toggles section visibility on click', () => {
    // Verify collapsible behavior
  })

  it('maintains collapse state', () => {
    // Verify state persistence
  })

  it('renders section title correctly', () => {
    // Verify section label rendering
  })
})
```

**BreadcrumbNav Tests** (`src/components/layout/breadcrumb-nav.test.tsx`):

```tsx
describe('BreadcrumbNav', () => {
  it('renders breadcrumbs based on current route', () => {
    // Mock useMatches and verify breadcrumb rendering
  })

  it('handles nested routes correctly', () => {
    // Test multi-level navigation
  })

  it('marks last breadcrumb as current page', () => {
    // Verify last item uses BreadcrumbPage component
  })
})
```

### Integration Testing

**Test Focus**: Sidebar and Router interaction

**Navigation Integration Tests** (`src/tests/navigation.test.tsx`):

```tsx
describe('Sidebar Navigation Integration', () => {
  it('navigates to correct route on link click', () => {
    // Click navigation item and verify route change
  })

  it('highlights active route in sidebar', () => {
    // Navigate and verify active styling
  })

  it('updates breadcrumbs after navigation', () => {
    // Navigate and verify breadcrumb update
  })

  it('preserves sidebar state across navigation', () => {
    // Verify sidebar doesn't reset on route change
  })
})
```

**Responsive Behavior Tests** (`src/tests/responsive.test.tsx`):

```tsx
describe('Sidebar Responsive Behavior', () => {
  it('shows sidebar inline on desktop', () => {
    // Test viewport >= 768px
  })

  it('shows sidebar in drawer on mobile', () => {
    // Test viewport < 768px
  })

  it('triggers sidebar toggle on button click', () => {
    // Test SidebarTrigger functionality
  })
})
```

### End-to-End Testing

**Test Focus**: Complete user workflows

**E2E Navigation Tests** (`e2e/sidebar-navigation.spec.ts`):

```tsx
test('user can navigate through sidebar menu', async () => {
  // 1. Visit home page
  // 2. Click sidebar navigation item
  // 3. Verify page content changes
  // 4. Verify active state in sidebar
  // 5. Verify breadcrumbs update
})

test('mobile user can access sidebar via trigger', async () => {
  // 1. Set mobile viewport
  // 2. Verify sidebar hidden initially
  // 3. Click trigger button
  // 4. Verify sidebar appears
  // 5. Click navigation item
  // 6. Verify navigation and sidebar closes
})

test('desktop user can collapse sidebar', async () => {
  // 1. Set desktop viewport
  // 2. Click collapse trigger
  // 3. Verify sidebar collapses
  // 4. Verify content area expands
  // 5. Click trigger again
  // 6. Verify sidebar expands
})

test('sidebar state persists across page refresh', async () => {
  // 1. Collapse sidebar
  // 2. Refresh page
  // 3. Verify sidebar remains collapsed
})
```

### Manual Testing Checklist

**Desktop (≥768px)**:

- [ ] Sidebar visible by default
- [ ] Sidebar can be collapsed/expanded
- [ ] Collapsed sidebar shows icons only
- [ ] Navigation items clickable and functional
- [ ] Active route highlighted correctly
- [ ] Collapsible sections expand/collapse
- [ ] Smooth transitions and animations
- [ ] Content area adjusts width properly

**Tablet (480px-767px)**:

- [ ] Sidebar toggleable via trigger button
- [ ] Sidebar overlays content when open
- [ ] Sidebar closes after navigation
- [ ] Touch interactions work smoothly

**Mobile (<480px)**:

- [ ] Sidebar hidden by default
- [ ] Trigger button visible and accessible
- [ ] Sidebar opens as drawer/sheet
- [ ] Full-height sidebar on mobile
- [ ] Close button accessible
- [ ] Swipe to close works (if implemented)

**Accessibility**:

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces navigation properly
- [ ] Focus management correct
- [ ] ARIA labels present and accurate
- [ ] Color contrast meets WCAG standards

---

## Development Phases

### Phase 1: Environment Preparation and Component Installation

**Duration**: 15-20 minutes  
**Goal**: Install ShadCN sidebar-02 and verify component availability

#### Step 1.1: Verify ShadCN Configuration

- Check `components.json` exists and is properly configured
- Verify TailwindCSS setup
- Confirm TypeScript configuration

```bash
cat components.json
```

Expected output should show ShadCN configuration with `style: "new-york"` and proper paths.

#### Step 1.2: Install sidebar-02 Block via ShadCN MCP

- Use ShadCN MCP to search for sidebar-02 component
- View component details to understand structure
- Install sidebar-02 and all dependencies

**Expected Installation**:

```bash
pnpm dlx shadcn@latest add @shadcn/sidebar-02
```

This installs:

- `src/components/ui/sidebar.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/dropdown-menu.tsx` (if not already present)
- `src/components/ui/label.tsx` (if not already present)
- `src/components/ui/input.tsx` (if not already present)

#### Step 1.3: Verify Installation

- Check all components created in `src/components/ui/`
- Run TypeScript compiler to verify no errors
- Check for peer dependency warnings

```bash
pnpm tsc --noEmit
```

#### Step 1.4: Review sidebar-02 Example

- Use ShadCN MCP to get sidebar-02 example code
- Study structure and patterns
- Identify customization points

**Deliverables**:

- ✅ All ShadCN UI components installed
- ✅ TypeScript compilation successful
- ✅ Understanding of sidebar-02 structure

---

### Phase 2: Navigation Configuration

**Duration**: 20-25 minutes  
**Goal**: Create type-safe navigation configuration

#### Step 2.1: Create Navigation Types File

Create `src/lib/navigation.ts` with:

- `NavItem` interface using TanStack Router's `LinkProps['to']`
- `NavSection` interface for collapsible sections
- Import necessary types from TanStack Router

```tsx
import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
```

#### Step 2.2: Define Navigation Structure

Implement `navigationConfig` array:

- Define initial sections (Getting Started, Features)
- Add navigation items for existing routes (/, /about, /demo/tanstack-query)
- Import icons from lucide-react

```tsx
import { Home, Info, Database } from 'lucide-react'
```

#### Step 2.3: Add Type Safety

Ensure:

- `to` property uses type-safe route paths
- TypeScript autocompletes available routes
- Invalid routes cause compilation errors

Test by trying an invalid route path - TypeScript should error.

#### Step 2.4: Document Navigation Configuration

Add JSDoc comments explaining:

- How to add new navigation items
- How to create new sections
- Icon selection guidance

**Deliverables**:

- ✅ `src/lib/navigation.ts` created
- ✅ Type-safe navigation configuration
- ✅ Initial navigation structure defined
- ✅ Documentation added

---

### Phase 3: Layout Component Creation

**Duration**: 40-50 minutes  
**Goal**: Build custom layout components wrapping ShadCN primitives

#### Step 3.1: Create Layout Directory Structure

```bash
mkdir -p src/components/layout
```

Create files:

- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/sidebar-header.tsx`
- `src/components/layout/nav-section.tsx`
- `src/components/layout/nav-item.tsx`
- `src/components/layout/breadcrumb-nav.tsx`

#### Step 3.2: Implement NavMenuItem Component

**File**: `src/components/layout/nav-item.tsx`

Key requirements:

- Accept `NavItem` type as props
- Use TanStack Router's `Link` component (NOT `<a>` tag)
- Apply `activeProps` for active route styling
- Render icon if provided
- Wrap in `SidebarMenuItem` and `SidebarMenuButton`

Critical pattern:

```tsx
<SidebarMenuButton asChild>
  <Link to={item.to} activeProps={{...}}>
    {/* content */}
  </Link>
</SidebarMenuButton>
```

#### Step 3.3: Implement CollapsibleNavSection Component

**File**: `src/components/layout/nav-section.tsx`

Key requirements:

- Accept `NavSection` type as props
- Use `Collapsible` component from ShadCN
- Manage open/closed state with `useState`
- Default to open state
- Render section title in `CollapsibleTrigger`
- Map section items to `NavMenuItem` components

Structure:

```tsx
<Collapsible>
  <SidebarGroup>
    <CollapsibleTrigger>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem />
        ))}
      </SidebarMenu>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

#### Step 3.4: Implement SidebarHeader Component

**File**: `src/components/layout/sidebar-header.tsx`

Key requirements:

- Display app branding/logo
- Show app name and version
- Optionally include search form (future enhancement)
- Use proper spacing and typography

Simple implementation:

```tsx
export function SidebarHeaderContent() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex flex-1 flex-col">
        <span className="font-semibold">OpenCode UI</span>
        <span className="text-xs text-muted-foreground">v1.0.0</span>
      </div>
    </div>
  )
}
```

#### Step 3.5: Implement AppSidebar Component

**File**: `src/components/layout/app-sidebar.tsx`

Key requirements:

- Import and compose all layout components
- Use ShadCN's `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarRail`
- Import `navigationConfig`
- Map navigation sections to `CollapsibleNavSection` components
- Accept and forward props to base `Sidebar` component

Structure:

```tsx
<Sidebar {...props}>
  <SidebarHeader>
    <SidebarHeaderContent />
  </SidebarHeader>

  <SidebarContent>
    {navigationConfig.map((section) => (
      <CollapsibleNavSection section={section} />
    ))}
  </SidebarContent>

  <SidebarFooter>{/* Footer content */}</SidebarFooter>

  <SidebarRail />
</Sidebar>
```

#### Step 3.6: Implement BreadcrumbNav Component

**File**: `src/components/layout/breadcrumb-nav.tsx`

Key requirements:

- Use `useMatches()` from TanStack Router
- Map route matches to breadcrumb items
- Use `BreadcrumbLink` for navigable items
- Use `BreadcrumbPage` for current page
- Filter out root route to avoid duplicate "Home"

Structure:

```tsx
const matches = useMatches()

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink to="/">Home</BreadcrumbLink>
    </BreadcrumbItem>

    {matches.filter(...).map(match => (
      <BreadcrumbItem>
        {/* Link or Page based on position */}
      </BreadcrumbItem>
    ))}
  </BreadcrumbList>
</Breadcrumb>
```

**Deliverables**:

- ✅ All layout components created
- ✅ TanStack Router Link integration working
- ✅ Navigation configuration consumed
- ✅ Breadcrumb component functional
- ✅ TypeScript compilation successful

---

### Phase 4: Root Route Integration

**Duration**: 25-30 minutes  
**Goal**: Replace Header with sidebar layout in root route

#### Step 4.1: Backup Current Root Route

```bash
cp src/routes/__root.tsx src/routes/__root.tsx.backup
```

This allows rollback if needed.

#### Step 4.2: Update Root Route Imports

Replace Header import with sidebar imports:

```tsx
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav'
```

Keep existing imports:

- `Outlet`, `createRootRouteWithContext` from TanStack Router
- DevTools imports
- QueryClient type

#### Step 4.3: Modify Root Component Structure

Replace:

```tsx
<>
  <Header />
  <Outlet />
  <DevTools />
</>
```

With:

```tsx
<SidebarProvider>
  <AppSidebar />

  <SidebarInset>
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <BreadcrumbNav />
    </header>

    <main className="flex flex-1 flex-col gap-4 p-4">
      <Outlet />
    </main>
  </SidebarInset>

  <TanStackDevtools {...devToolsConfig} />
</SidebarProvider>
```

#### Step 4.4: Preserve Router Context

Ensure `MyRouterContext` interface remains unchanged:

```tsx
interface MyRouterContext {
  queryClient: QueryClient
}
```

No changes needed to `createRootRouteWithContext` call.

#### Step 4.5: Verify DevTools Placement

DevTools should remain at root level, outside `SidebarInset` but inside `SidebarProvider`. This ensures they're accessible regardless of sidebar state.

#### Step 4.6: Test Compilation

```bash
pnpm tsc --noEmit
```

Verify no TypeScript errors.

#### Step 4.7: Remove Old Header Component (Optional)

After verifying new layout works:

```bash
rm src/components/Header.tsx
```

Or keep as reference until fully tested.

**Deliverables**:

- ✅ Root route updated with sidebar layout
- ✅ Backup created for rollback
- ✅ DevTools preserved and accessible
- ✅ Router context maintained
- ✅ TypeScript compilation successful

---

### Phase 5: Styling and Responsive Implementation

**Duration**: 20-25 minutes  
**Goal**: Ensure proper styling and responsive behavior

#### Step 5.1: Verify TailwindCSS Classes

- Check that all ShadCN sidebar classes are available
- Verify CSS variables in `globals.css` for sidebar colors
- Test dark mode compatibility (if applicable)

Expected CSS variables in `globals.css`:

```css
--sidebar-background
--sidebar-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

#### Step 5.2: Test Responsive Breakpoints

Start dev server:

```bash
pnpm dev
```

Test at different viewport sizes:

- **Desktop (≥768px)**: Sidebar inline, collapsible
- **Tablet (480-767px)**: Sidebar toggleable
- **Mobile (<480px)**: Sidebar in drawer

Verify `SidebarProvider` handles breakpoints automatically.

#### Step 5.3: Adjust Content Area Spacing

Ensure main content area has proper padding and spacing:

```tsx
<main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
  <Outlet />
</main>
```

Adjust values as needed for design consistency.

#### Step 5.4: Verify Header Styling

Check header alignment and spacing:

```tsx
<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
  <SidebarTrigger />
  <Separator orientation="vertical" className="h-6" />
  <BreadcrumbNav />
</header>
```

#### Step 5.5: Test Collapsible Animations

- Verify smooth transitions for collapsible sections
- Check sidebar collapse/expand animation
- Test mobile drawer slide-in/out

If animations are too fast/slow, adjust via Tailwind config or component props.

#### Step 5.6: Test Dark Mode (if applicable)

If dark mode is enabled:

- Verify sidebar colors in dark mode
- Check contrast ratios
- Test active link visibility

**Deliverables**:

- ✅ Responsive behavior working at all breakpoints
- ✅ Proper spacing and layout
- ✅ Smooth animations
- ✅ Dark mode compatible (if applicable)
- ✅ Visual design matches ShadCN patterns

---

### Phase 6: Testing and Quality Assurance

**Duration**: 30-40 minutes  
**Goal**: Comprehensive testing of all functionality

#### Step 6.1: Navigation Functionality Testing

Manual test cases:

- [ ] Click each navigation item
- [ ] Verify correct route loads
- [ ] Check active route highlighting
- [ ] Test nested routes (if any)
- [ ] Verify breadcrumbs update correctly

#### Step 6.2: Responsive Behavior Testing

**Desktop Testing (≥768px)**:

- [ ] Sidebar visible by default
- [ ] Click collapse trigger - sidebar collapses
- [ ] Collapsed sidebar shows icons only
- [ ] Click expand trigger - sidebar expands
- [ ] State persists during navigation
- [ ] Content area adjusts width appropriately

**Mobile Testing (<768px)**:

- [ ] Sidebar hidden by default
- [ ] Hamburger menu visible
- [ ] Click trigger - sidebar opens as drawer
- [ ] Click navigation item - sidebar closes and navigates
- [ ] Click outside - sidebar closes
- [ ] Smooth animations

#### Step 6.3: Collapsible Sections Testing

- [ ] All sections collapsed - sections collapse
- [ ] Click section header - section expands
- [ ] State maintained during navigation
- [ ] Smooth expand/collapse animation
- [ ] Multiple sections can be open simultaneously

#### Step 6.4: Integration Testing

**TanStack Query Integration**:

- [ ] Navigate to TanStack Query demo page
- [ ] Verify queries execute correctly
- [ ] Check DevTools accessibility

**Router Integration**:

- [ ] Type safety in navigation confirmed
- [ ] Route params work (if any)
- [ ] Search params work (if any)
- [ ] Browser back/forward buttons work

**DevTools Integration**:

- [ ] TanStack Router DevTools accessible
- [ ] TanStack Query DevTools accessible
- [ ] DevTools don't interfere with sidebar

#### Step 6.5: Accessibility Testing

**Keyboard Navigation**:

- [ ] Tab through sidebar items
- [ ] Enter activates navigation
- [ ] Escape closes mobile drawer
- [ ] Arrow keys navigate (if applicable)

**Screen Reader**:

- [ ] Navigation items announced correctly
- [ ] Active route indicated
- [ ] Collapsible sections announced
- [ ] Breadcrumbs readable

#### Step 6.6: Performance Testing

- [ ] Initial page load time acceptable
- [ ] Navigation transitions smooth
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Sidebar animations perform well on mobile

#### Step 6.7: Cross-Browser Testing (if time permits)

Test in:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)

#### Step 6.8: Error Scenarios

- [ ] Navigate to non-existent route - error handling works
- [ ] Rapid navigation clicks - no race conditions
- [ ] Resize window during navigation - layout stable

**Deliverables**:

- ✅ All test cases passed
- ✅ Issues documented (if any)
- ✅ Fixes applied for critical issues
- ✅ Non-critical issues logged for future work

---

### Phase 7: Documentation and Cleanup

**Duration**: 15-20 minutes  
**Goal**: Document implementation and clean up

#### Step 7.1: Add Code Documentation

Add JSDoc comments to:

- Navigation configuration file
- Main layout components
- Complex logic (collapsible sections, breadcrumbs)

Example:

````tsx
/**
 * Main application sidebar component.
 * Integrates with TanStack Router for navigation.
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <AppSidebar />
 *   <SidebarInset>{content}</SidebarInset>
 * </SidebarProvider>
 * ```
 */
````

#### Step 7.2: Update Component Documentation

Create brief documentation for:

- How to add new navigation items
- How to add new sections
- How to customize sidebar appearance
- How to control sidebar programmatically

Can be added as comments in `navigation.ts` or separate README in `src/components/layout/`.

#### Step 7.3: Clean Up Unused Code

- Remove old Header component if not needed
- Remove backup root route file after confirming stability
- Clean up unused imports
- Remove console.logs or debug code

#### Step 7.4: Run Linter and Formatter

```bash
pnpm run check
```

Fix any linting issues or formatting inconsistencies.

#### Step 7.5: Final TypeScript Check

```bash
pnpm tsc --noEmit
```

Ensure no type errors remain.

#### Step 7.6: Create Implementation Notes

Document in task file:

- Deviations from original plan
- Customizations made
- Known limitations
- Future enhancement opportunities

**Deliverables**:

- ✅ Code documented
- ✅ Cleanup completed
- ✅ Linting passed
- ✅ TypeScript compilation successful
- ✅ Implementation notes created

---

## Success Criteria

### Functional Requirements ✓

**Navigation**:

- ✅ All navigation links functional and type-safe
- ✅ Active route highlighted correctly
- ✅ Breadcrumbs update on route change
- ✅ Nested routes supported (if applicable)

**Sidebar Behavior**:

- ✅ Collapsible sections expand/collapse smoothly
- ✅ Sidebar can be collapsed/expanded on desktop
- ✅ Mobile drawer opens/closes correctly
- ✅ State persists across navigation

**Layout**:

- ✅ Sidebar integrated as root layout
- ✅ Content area renders child routes via Outlet
- ✅ Header with trigger and breadcrumbs present
- ✅ DevTools remain accessible

### Non-Functional Requirements ✓

**Performance**:

- ✅ Initial load time < 2 seconds
- ✅ Navigation transitions smooth (60fps)
- ✅ No layout shift during sidebar toggle
- ✅ Minimal re-renders during navigation

**Type Safety**:

- ✅ No TypeScript errors
- ✅ Navigation routes autocomplete
- ✅ Invalid routes caught at compile time
- ✅ Props properly typed

**Responsiveness**:

- ✅ Desktop (≥768px): Inline sidebar, collapsible
- ✅ Tablet (480-767px): Toggleable sidebar
- ✅ Mobile (<480px): Drawer sidebar
- ✅ Smooth transitions between breakpoints

**Accessibility**:

- ✅ Keyboard navigation functional
- ✅ Screen reader compatible
- ✅ ARIA labels present and correct
- ✅ Focus management proper

**Code Quality**:

- ✅ Follows TanStack Router patterns
- ✅ Follows ShadCN conventions
- ✅ Clean, readable code
- ✅ Properly documented
- ✅ No code duplication
- ✅ Linting passed

### Integration Requirements ✓

**TanStack Router**:

- ✅ File-based routing preserved
- ✅ Router context maintained
- ✅ Type-safe navigation working
- ✅ Route prefetching functional

**TanStack Query**:

- ✅ Query integration preserved
- ✅ Queries execute correctly
- ✅ DevTools accessible

**ShadCN UI**:

- ✅ Components installed correctly
- ✅ Styling consistent with theme
- ✅ Dark mode compatible (if applicable)
- ✅ Animations smooth

---

## Risk Mitigation

### Risk: ShadCN Component Installation Fails

**Mitigation**:

- Verify `components.json` configuration before installation
- Use ShadCN MCP to check component availability
- Manual installation fallback if needed

### Risk: TanStack Router Link Integration Issues

**Mitigation**:

- Follow examples from TanStack Router docs
- Test with simple routes first
- Verify type inference working before complex routes

### Risk: Responsive Behavior Not Working

**Mitigation**:

- Use ShadCN's built-in responsive logic (don't override)
- Test at each breakpoint during development
- Use browser DevTools device emulation

### Risk: Performance Issues with Large Navigation

**Mitigation**:

- Keep initial navigation structure simple
- Lazy load heavy sections if needed
- Memoize components to prevent re-renders
- Consider virtual scrolling for very large menus (future)

### Risk: Accessibility Issues

**Mitigation**:

- Use ShadCN components as-is (they're accessible by default)
- Test with keyboard during development
- Use axe DevTools for automated accessibility testing
- Add ARIA labels where custom components used

### Risk: Breaking Existing Functionality

**Mitigation**:

- Create backup of `__root.tsx` before modifications
- Test TanStack Query integration after changes
- Verify DevTools accessibility throughout
- Incremental testing at each phase

---

## Rollback Plan

If critical issues arise during implementation:

### Step 1: Restore Root Route

```bash
mv src/routes/__root.tsx.backup src/routes/__root.tsx
```

### Step 2: Remove Layout Components

```bash
rm -rf src/components/layout/
rm src/lib/navigation.ts
```

### Step 3: Verify Application Functionality

```bash
pnpm dev
```

Test basic navigation and functionality.

### Step 4: Decide Next Steps

- Debug issues and retry
- Postpone implementation
- Use alternative approach (custom header navigation)

### Step 5: Optional - Remove ShadCN Sidebar Components

Only if needed to fully clean up:

```bash
rm src/components/ui/sidebar.tsx
rm src/components/ui/collapsible.tsx
# etc.
```

---

## Future Enhancements

### Phase 2: Enhanced Navigation Features

- **Search functionality** - Add command palette (Cmd+K) for quick navigation
- **Recent pages** - Track and display recently visited routes
- **Favorites/Bookmarks** - Allow users to pin frequently used pages
- **Keyboard shortcuts** - Add keyboard shortcuts for common navigation actions

### Phase 3: Advanced Sidebar Features

- **Multi-level nested navigation** - Support deeper menu hierarchies
- **Dynamic menu items** - Load navigation from API/database
- **Role-based navigation** - Show/hide items based on user permissions
- **Sidebar themes** - Allow users to customize sidebar appearance
- **Custom sidebar width** - Adjustable sidebar width preference

### Phase 4: Performance Optimizations

- **Virtual scrolling** - For extremely large navigation menus
- **Progressive enhancement** - Load non-critical features after initial render
- **Preload hover intent** - Aggressive prefetching on navigation hover
- **Route-based code splitting** - Further optimize bundle size

### Phase 5: User Experience Enhancements

- **Sidebar state persistence** - Save sidebar state to localStorage
- **Collapsible state persistence** - Remember which sections are expanded
- **Smooth page transitions** - Animated route transitions
- **Loading states** - Better visual feedback during navigation
- **Toast notifications** - User feedback for navigation actions

---

## Estimated Timeline

| Phase                              | Duration  | Cumulative |
| ---------------------------------- | --------- | ---------- |
| Phase 1: Component Installation    | 15-20 min | 20 min     |
| Phase 2: Navigation Configuration  | 20-25 min | 45 min     |
| Phase 3: Layout Components         | 40-50 min | 95 min     |
| Phase 4: Root Route Integration    | 25-30 min | 125 min    |
| Phase 5: Styling and Responsive    | 20-25 min | 150 min    |
| Phase 6: Testing and QA            | 30-40 min | 190 min    |
| Phase 7: Documentation and Cleanup | 15-20 min | 210 min    |

**Total Estimated Time**: 3-4 hours

**Actual Time May Vary Based On**:

- Familiarity with TanStack Router
- Familiarity with ShadCN UI
- Number of navigation items
- Complexity of testing requirements
- Debugging time for issues

---

## Resources and References

### Primary Documentation

- [TanStack Router - Setup and Architecture](/.github/instructions/tanstack-react-router_setup-and-architecture.instructions.md)
- [TanStack Router - Routing](/.github/instructions/tanstack-react-router_routing.instructions.md)
- [TanStack Router - API Reference](/.github/instructions/tanstack-react-router_api.instructions.md)
- [TanStack Router - Guide](/.github/instructions/tanstack-react-router_guide.instructions.md)

### ShadCN Resources

- ShadCN sidebar-02 component (via MCP)
- ShadCN Sidebar documentation
- ShadCN Blocks examples

### Project Files

- Current root route: `src/routes/__root.tsx`
- TanStack Query integration: `src/integrations/tanstack-query/`
- Component configuration: `components.json`
- TypeScript config: `tsconfig.json`

### Tools and Libraries

- **TanStack Router**: v1.132.0
- **React**: v19.0.0
- **TypeScript**: v5.7.2
- **Tailwind CSS**: v4.0.6
- **ShadCN CLI**: v3.4.2
- **Lucide Icons**: v0.544.0

---

## Conclusion

This implementation plan provides a comprehensive, step-by-step guide to integrating ShadCN's sidebar-02 component with TanStack Router. The plan prioritizes:

1. **Type Safety** - Leveraging TypeScript and TanStack Router's type inference
2. **Best Practices** - Following established patterns from both libraries
3. **Maintainability** - Creating clear, documented, reusable components
4. **User Experience** - Ensuring responsive design and smooth interactions
5. **Testing** - Comprehensive testing at each phase

By following this plan methodically, the implementation should result in a robust, professional sidebar navigation system that serves as the foundation for the application's navigation architecture.

**Key Success Factors**:

- Use ShadCN MCP for component installation
- Replace `<a>` tags with TanStack Router `<Link>` components
- Maintain router context throughout
- Test responsively at each phase
- Document customizations and deviations

**Next Steps**:

1. Review this plan thoroughly
2. Begin Phase 1: Component Installation
3. Follow each phase sequentially
4. Test continuously throughout implementation
5. Document any issues or learnings
