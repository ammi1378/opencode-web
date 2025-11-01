import { describe, expect, it } from 'vitest'
import { serverFormSchema, validateUniqueServerName } from './validation'
import type { Server } from './types'

describe('serverFormSchema', () => {
  it('should validate correct server data', () => {
    const valid = serverFormSchema.parse({
      name: 'Production Server',
      url: 'https://api.example.com',
    })
    expect(valid).toBeDefined()
    expect(valid.name).toBe('Production Server')
    expect(valid.url).toBe('https://api.example.com')
  })

  it('should reject invalid URLs', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'Test',
        url: 'not-a-url',
      }),
    ).toThrow()
  })

  it('should reject URLs without protocol', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'Test',
        url: 'api.example.com',
      }),
    ).toThrow()
  })

  it('should reject names over 50 characters', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'a'.repeat(51),
        url: 'https://example.com',
      }),
    ).toThrow()
  })

  it('should reject empty names', () => {
    expect(() =>
      serverFormSchema.parse({
        name: '',
        url: 'https://example.com',
      }),
    ).toThrow()
  })

  it('should reject empty URLs', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'Test Server',
        url: '',
      }),
    ).toThrow()
  })

  it('should accept valid special characters in names', () => {
    const valid = serverFormSchema.parse({
      name: 'Test-Server_1',
      url: 'https://example.com',
    })
    expect(valid.name).toBe('Test-Server_1')
  })

  it('should reject invalid characters in names', () => {
    expect(() =>
      serverFormSchema.parse({
        name: 'Test@Server',
        url: 'https://example.com',
      }),
    ).toThrow()
  })
})

describe('validateUniqueServerName', () => {
  const existingServers: Array<Server> = [
    {
      id: '1',
      identifier: 0,
      name: 'Production',
      url: 'https://example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      identifier: 1,
      name: 'Staging',
      url: 'https://staging.example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  it('should return false for duplicate names (case-insensitive)', () => {
    expect(validateUniqueServerName('production', existingServers)).toBe(false)
    expect(validateUniqueServerName('PRODUCTION', existingServers)).toBe(false)
  })

  it('should return true for unique names', () => {
    expect(validateUniqueServerName('Development', existingServers)).toBe(true)
  })

  it('should allow same name when editing same server', () => {
    expect(validateUniqueServerName('Production', existingServers, '1')).toBe(
      true,
    )
  })

  it('should reject same name when editing different server', () => {
    expect(validateUniqueServerName('Production', existingServers, '2')).toBe(
      false,
    )
  })

  it('should handle empty existing servers', () => {
    expect(validateUniqueServerName('New Server', [])).toBe(true)
  })
})
