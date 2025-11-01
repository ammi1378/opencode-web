import { useState } from 'react'
import type { Server, ServerFormData } from '@/lib/servers/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  serverFormSchema,
  validateUniqueServerName,
} from '@/lib/servers/validation'

interface ServerFormProps {
  defaultValues?: Partial<ServerFormData>
  onSubmit: (data: ServerFormData) => Promise<void>
  existingServers: Array<Server>
  mode: 'add' | 'edit'
}

export function ServerForm({
  defaultValues,
  onSubmit,
  existingServers,
  mode,
}: ServerFormProps) {
  const [formData, setFormData] = useState<ServerFormData>({
    name: defaultValues?.name || '',
    url: defaultValues?.url || '',
  })
  const [errors, setErrors] = useState<Partial<ServerFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: keyof ServerFormData, value: string) => {
    try {
      serverFormSchema.shape[name].parse(value)
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    } catch (error) {
      if (error instanceof Error) {
        setErrors((prev) => ({ ...prev, [name]: error.message }))
      }
    }
  }

  const handleInputChange =
    (field: keyof ServerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
      validateField(field, value)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const validated = serverFormSchema.parse(formData)

      if (
        !validateUniqueServerName(
          validated.name,
          existingServers,
          mode === 'edit' ? (defaultValues as Server).id : undefined,
        )
      ) {
        setErrors({ name: 'A server with this name already exists' })
        return
      }

      await onSubmit(validated)
      setFormData({ name: '', url: '' })
      setErrors({})
    } catch (error) {
      if (error instanceof Error) {
        console.error('Form validation error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4">
      <div className="space-y-2">
        <Label htmlFor="name">Server Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Production Server"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Server URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={handleInputChange('url')}
          placeholder="https://api.opencode.dev"
          disabled={isSubmitting}
        />
        {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : mode === 'add'
              ? 'Add Server'
              : 'Update Server'}
        </Button>
      </div>
    </form>
  )
}
