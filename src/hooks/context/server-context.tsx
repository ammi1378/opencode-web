import { createContext } from 'react'
import type { Server } from '@/lib/servers/types'

export const ServerContext = createContext<{
  servers?: Array<Server> | undefined
  selectedServer?: Server | undefined
  setSelectedServer?: (server: Server | undefined) => any
}>({})
