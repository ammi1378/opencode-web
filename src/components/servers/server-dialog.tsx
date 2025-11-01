import { ServerForm } from './server-form'
import type { Server, ServerFormData } from '@/lib/servers/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface ServerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  server?: Server
  onSubmit: (data: ServerFormData) => Promise<void>
  existingServers: Array<Server>
}

export function ServerDialog({
  open,
  onOpenChange,
  server,
  onSubmit,
  existingServers,
}: ServerDialogProps) {
  const mode = server ? 'edit' : 'add'

  const handleSubmit = async (data: ServerFormData) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>
            {mode === 'add' ? 'Add Server' : 'Edit Server'}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ServerForm
            defaultValues={server}
            onSubmit={handleSubmit}
            existingServers={existingServers}
            mode={mode}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
