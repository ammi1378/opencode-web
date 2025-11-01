import { Link } from '@tanstack/react-router'
import type { NavItem } from '@/lib/navigation'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

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
