import type { TextPart } from '@/lib/api/model'
import Markdown from 'react-markdown'

interface TextPartProps {
  part: TextPart
}

export function TextPart({ part }: TextPartProps) {
  if (!part.text?.length) return undefined
  return (
    <div className="prose max-w-none">
      <Markdown>{part.text}</Markdown>
    </div>
  )
}
