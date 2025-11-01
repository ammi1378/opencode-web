import { z } from 'zod'
import type { Server } from './types'

export const serverFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Server name is required')
    .max(50, 'Server name must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Server name can only contain letters, numbers, spaces, hyphens, and underscores',
    ),
  url: z
    .string()
    .min(1, 'Server URL is required')
    .refine((url) => {
      try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Please enter a valid URL starting with http:// or https://'),
})

export type ServerFormData = z.infer<typeof serverFormSchema>

export function validateUniqueServerName(
  name: string,
  existingServers: Array<Server>,
  currentServerId?: string,
): boolean {
  return !existingServers.some(
    (server) =>
      server.name.toLowerCase() === name.toLowerCase() &&
      server.id !== currentServerId,
  )
}
