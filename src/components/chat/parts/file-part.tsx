import type { FilePart } from '@/lib/api/model'

interface FilePartProps {
  part: FilePart
}

export function FilePart({ part }: FilePartProps) {
  return (
    <div className="">
      {part.mime === 'text/plain' && (
        <span className="bg-blue-700 text-white px-2 py-1">TXT</span>
      )}
      {part.filename}
    </div>
  )
}
