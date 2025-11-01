import { Database, Home, Info, Server } from 'lucide-react'
import type { LinkProps } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  to: LinkProps['to']
  icon?: LucideIcon
  badge?: string
  items?: Array<NavItem>
}

export interface NavSection {
  title: string
  items: Array<NavItem>
}

/**
 * Navigation configuration for the application sidebar.
 *
 * This configuration defines the structure of the sidebar navigation with
 * collapsible sections and type-safe routing using TanStack Router.
 *
 * To add new navigation items:
 * 1. Import the icon from lucide-react at the top of the file
 * 2. Add the item to the appropriate section in navigationConfig
 * 3. Use type-safe route paths for the 'to' property - TypeScript will autocomplete available routes
 *
 * Example of adding a new item:
 * ```tsx
 * {
 *   title: 'New Page',
 *   to: '/new-page',
 *   icon: NewIcon,
 * }
 * ```
 *
 * To add a new section:
 * ```tsx
 * {
 *   title: 'New Section',
 *   items: [
 *     // navigation items here
 *   ],
 * }
 * ```
 */
export const navigationConfig: Array<NavSection> = [
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
