import type { Server } from '@/lib/servers/types'
import { createContext } from 'react'

export const ServerContext = createContext<Server | undefined>(undefined)
