import { SidebarHeaderContent } from './sidebar-header'
import { CollapsibleNavSection } from './nav-section'
import type { ComponentProps } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { navigationConfig } from '@/lib/navigation'

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {}

/**
 * Main application sidebar component.
 * Integrates with TanStack Router for navigation and provides collapsible sections.
 *
 * @example
 * ```tsx
 * <SidebarProvider>
 *   <AppSidebar />
 *   <SidebarInset>{content}</SidebarInset>
 * </SidebarProvider>
 * ```
 */
export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>

      <SidebarContent>
        {navigationConfig.map((section) => (
          <CollapsibleNavSection key={section.title} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Footer content can be added here - user menu, settings, etc. */}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
