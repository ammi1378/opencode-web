import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { serversStorage } from './storage'
import type { Server } from './types'

describe('serversStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return empty array when no data exists', () => {
    const result = serversStorage.get()
    expect(result).toEqual([])
  })

  it('should save and retrieve servers', () => {
    const servers: Array<Server> = [
      {
        id: '1',
        identifier: 0,
        name: 'Test Server',
        url: 'https://test.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    serversStorage.set(servers)
    const result = serversStorage.get()
    expect(result).toEqual(servers)
  })

  it('should handle corrupted data gracefully', () => {
    localStorage.setItem('opencode-ui.servers.v1', 'invalid json')
    const result = serversStorage.get()
    expect(result).toEqual([])
  })

  it('should migrate v1 data to v2 with identifiers', () => {
    // Simulate v1 data (without identifiers)
    const v1Data = {
      version: 1,
      servers: [
        {
          id: '1',
          name: 'Test Server 1',
          url: 'https://test1.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Test Server 2',
          url: 'https://test2.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }

    localStorage.setItem('opencode-ui.servers.v1', JSON.stringify(v1Data))
    const result = serversStorage.get()

    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('identifier', 0)
    expect(result[1]).toHaveProperty('identifier', 1)
    expect(result[0].name).toBe('Test Server 1')
    expect(result[1].name).toBe('Test Server 2')
  })

  it('should clear servers', () => {
    const servers: Array<Server> = [
      {
        id: '1',
        identifier: 0,
        name: 'Test Server',
        url: 'https://test.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    serversStorage.set(servers)
    expect(serversStorage.get()).toEqual(servers)

    serversStorage.clear()
    expect(serversStorage.get()).toEqual([])
  })
})
