import { TextPart } from './parts/text-part'
import { FilePart } from './parts/file-part'
import { ToolPart } from './parts/tool-part'
import { PatchPart } from './parts/patch-part'
import type { Part } from '@/lib/api/model'

interface SessionChatMessagePartProps {
  part: Part
  index: number
}

export function SessionChatMessagePart({ part }: SessionChatMessagePartProps) {
  if (part.type === 'text' && !part.synthetic) {
    return <TextPart part={part} />
  } else if (part.type === 'file') {
    return <FilePart part={part} />
  } else if (part.type === 'tool') {
    return <ToolPart part={part} />
  } else if (part.type === 'patch') {
    return <PatchPart part={part} />
  } else if (part.type === 'reasoning' && part.text?.length) {
    return (
      <div className="">
        Resoning:
        {part.text?.replace('</think>', '')}
      </div>
    )
  } else if (part.type === 'step-start' || part.type === 'step-finish') {
    return undefined
  }

  return undefined
  // if (part.)
  // return <div className="py-4">type: {part.type} NOT_IMPLEMENTED!</div>
}
