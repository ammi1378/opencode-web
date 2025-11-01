export interface Server {
  id: string
  identifier: number
  name: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface ServerFormData {
  name: string
  url: string
}

export interface ServersStorage {
  version: number
  servers: Array<Server>
}
