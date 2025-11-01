import type { Agent, Config, Model, Provider } from '@/lib/api/model'
import { createContext } from 'react'
export interface ISessionContext {
  context?: {
    mode?: string
    providerID?: string
    modelID?: string
    config?: Config | undefined
    agentsConfig?: {
      primaryAgents: Agent[]
      subAgents: Agent[]
    }
    providers?: IProviderContext[]
  }
  updateContext: (data: ISessionContext['context']) => void
}

export interface IProviderContext extends Omit<Provider, 'models'> {
  models: Model[]
}
export const SessionContext = createContext<ISessionContext>({
  updateContext: () => {},
})
