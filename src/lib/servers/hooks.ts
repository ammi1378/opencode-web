import { useCallback, useEffect, useState } from 'react'
import { serverIdentifierUtils, serversStorage } from './storage'
import { serverFormSchema, validateUniqueServerName } from './validation'
import type { Server, ServerFormData } from './types'

export interface ServerSession {
  id: string
  projectID: string
  directory: string
  parentID?: string
  share?: {
    url: string
  }
  title: string
  version: string
  time: {
    created: number
    updated: number
    compacting?: number
  }
  revert?: {
    messageID: string
    partID?: string
    snapshot?: string
    diff?: string
  }
}

export function useServers() {
  const [servers, setServers] = useState<Array<Server>>([])
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
        identifier: serverIdentifierUtils.getNextIdentifier(servers),
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
      // Reassign identifiers to maintain sequential order
      const reassignedServers =
        serverIdentifierUtils.reassignIdentifiers(updatedServers)
      serversStorage.set(reassignedServers)
      setServers(reassignedServers)
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
