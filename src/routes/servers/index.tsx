import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { Server, ServerFormData } from '@/lib/servers/types'
import { useServers } from '@/lib/servers/hooks'
import { ServersList } from '@/components/servers/servers-list'
import { ServerDialog } from '@/components/servers/server-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/servers/')({
  component: ServersPage,
})

function ServersPage() {
  const { servers, isLoading, addServer, updateServer, deleteServer } =
    useServers()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<Server | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null)

  const handleAddServer = () => {
    setEditingServer(null)
    setDialogOpen(true)
  }

  const handleEditServer = (server: Server) => {
    setEditingServer(server)
    setDialogOpen(true)
  }

  const handleDeleteServer = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId)
    if (server) {
      setServerToDelete(server)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteServer = async () => {
    if (serverToDelete) {
      try {
        await deleteServer(serverToDelete.id)
        setDeleteDialogOpen(false)
        setServerToDelete(null)
      } catch (error) {
        console.error('Failed to delete server:', error)
        alert('Failed to delete server. Please try again.')
      }
    }
  }

  const handleSubmit = async (data: ServerFormData) => {
    try {
      if (editingServer) {
        await updateServer(editingServer.id, data)
      } else {
        await addServer(data)
      }
    } catch (error) {
      console.error('Failed to save server:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to save server. Please try again.',
      )
    }
  }

  return (
    <div className="container mx-auto py-8">
      <ServersList
        servers={servers}
        onEdit={handleEditServer}
        onDelete={handleDeleteServer}
        onAddServer={handleAddServer}
        isLoading={isLoading}
      />

      <ServerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        server={editingServer || undefined}
        onSubmit={handleSubmit}
        existingServers={servers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serverToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteServer}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
