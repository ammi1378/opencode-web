import type { Server, ServersStorage } from './types'

const STORAGE_KEY = 'opencode-ui.servers.v1'
const STORAGE_VERSION = 2

export const serversStorage = {
  get(): Array<Server> {
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

  set(servers: Array<Server>): void {
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

function migrateServersData(data: ServersStorage): Array<Server> {
  if (data.version === 1) {
    // Migrate v1 to v2: Add auto-incrementing identifiers
    return data.servers.map((server, index) => ({
      ...server,
      identifier: index, // Assign sequential identifiers starting from 0
    }))
  }
  return data.servers
}

export const serverIdentifierUtils = {
  getNextIdentifier: (servers: Array<Server>): number => {
    return Math.max(...servers.map((s) => s.identifier), -1) + 1
  },

  reassignIdentifiers: (servers: Array<Server>): Array<Server> => {
    return servers
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((server, index) => ({
        ...server,
        identifier: index,
      }))
  },
}
