import { useState } from 'react'
import { Copy, Edit, MessageSquare, Server, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Server as ServerType } from '@/lib/servers/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ServerCardProps {
  server: ServerType
  onEdit: (server: ServerType) => void
  onDelete: (serverId: string) => void
}

export function ServerCard({ server, onEdit, onDelete }: ServerCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(server.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Server className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{server.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {server.url}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleCopyUrl}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy URL'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/servers/$serverId/sessions"
                  params={{ serverId: server.identifier.toString() }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Sessions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(server)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(server.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Created:{' '}
          {new Date(server.createdAt).toLocaleDateString(undefined, {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
