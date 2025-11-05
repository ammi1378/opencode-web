import { createContext } from 'react'
import type {
  Agent,
  Config,
  ConfigCommand,
  Model,
  Provider,
} from '@/lib/api/model'

export interface ISessionContext {
  context?: {
    mode?: string
    providerID?: string
    modelID?: string
    config?: Config | undefined
    agentsConfig?: {
      primaryAgents: Array<Agent>
      subAgents: Array<Agent>
    }
    providers?: Array<IProviderContext>
    commands?: Array<ConfigCommand[keyof ConfigCommand] & { name: string }>
  }
  updateContext: (data: ISessionContext['context']) => void
}

export interface IProviderContext extends Omit<Provider, 'models'> {
  models: Array<Model>
}
export const SessionContext = createContext<ISessionContext>({
  updateContext: () => {},
})
