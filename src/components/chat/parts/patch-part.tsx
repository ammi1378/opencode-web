import type { PatchPart } from '@/lib/api/model'

interface PatchPartProps {
  part: PatchPart
}

export function PatchPart({ part }: PatchPartProps) {
  return (
    <div className="prose-sm max-w-none">
      <h2>File Changes:</h2>
      <pre className="py-0 px-0">
        <ul>
          {part.files?.map((file) => {
            return <li>{file}</li>
          })}
        </ul>
      </pre>
    </div>
  )
}
