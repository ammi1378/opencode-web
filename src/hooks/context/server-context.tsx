import type { Server } from '@/lib/servers/types'
import { createContext } from 'react'

export const ServerContext = createContext<{
  servers?: Server[] | undefined
  selectedServer?: Server | undefined
  setSelectedServer?: (server: Server | undefined) => any
}>({})
