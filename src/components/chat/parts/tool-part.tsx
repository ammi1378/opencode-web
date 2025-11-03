import { Button } from '@/components/ui/button'
import { ServerContext } from '@/hooks/context/server-context'
import type { ToolPart } from '@/lib/api/model'
import {
  assertToolBash,
  assertToolEdit,
  assertToolGlob,
  assertToolRead,
  assertToolTask,
  assertToolWrite,
  type GenericCompleteStateTask,
  type ITaskToolPart,
} from '@/lib/util/task-type-assertion'
import { Link } from '@tanstack/react-router'
import { Eye, LoaderIcon } from 'lucide-react'
import { useContext } from 'react'
// import Markdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import ReactDiffViewer from 'react-diff-viewer'
import Markdown from 'react-markdown'
interface ToolPartProps {
  part: ToolPart
}

export function ToolPart({ part }: ToolPartProps) {
  if (part.state.status === 'pending') {
    return (
      <div className="flex items-center justify-start space-x-2">
        <span>Pending tool: {part.tool}</span>
        <LoaderIcon className="animate-spin" />
      </div>
    )
  }
  if (part.state.status === 'error') {
    return (
      <div className="text-red-500">
        [{part.tool}]: {part.state.status} {part.state.error}
      </div>
    )
  }
  if (assertToolRead(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={part.state.title}
        titlePrefix={part.tool}
      >
        {part.state.status === 'completed' &&
        part.state.metadata.preview?.length ? (
          <div className="mt-4">
            <span className="text-sm font-semibold">Preview:</span>
            <div className="prose-sm max-w-none border border-neutral-200 rounded">
              <SyntaxHighlighter style={dracula}>
                {part.state.metadata.preview}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          ''
        )}
      </ToolPartContainer>
    )
  } else if (assertToolTask(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={part.state.title}
        titlePrefix={part.tool}
      >
        <TaskToolPart part={part} />
      </ToolPartContainer>
    )
  } else if (assertToolEdit(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={part.state.title}
        titlePrefix={part.tool}
      >
        {part.state.status === 'completed' ? (
          <ReactDiffViewer
            newValue={part.state.input.newString}
            oldValue={part.state.input.oldString}
          />
        ) : undefined}
      </ToolPartContainer>
    )
  } else if (assertToolWrite(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={part.state.title}
        titlePrefix={part.tool}
      >
        {part.state.status === 'completed' ? (
          <ReactDiffViewer
            newValue={part.state.input.content}
            splitView={false}
          />
        ) : undefined}
      </ToolPartContainer>
    )
  } else if (assertToolBash(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={
          part.state.status === 'completed'
            ? part.state.metadata.description
            : part.state.title
        }
        titlePrefix={part.tool}
      >
        {part.state.status === 'completed' &&
        (part.state.output?.length || part.state.input?.command?.length) ? (
          <div className="mt-4">
            <span className="text-sm font-semibold">Preview:</span>
            <div className="prose-sm max-w-none border border-neutral-200 rounded">
              <SyntaxHighlighter style={dracula} language="shell">
                {(part.state.input?.command?.length
                  ? part.state.input?.command + '\n'
                  : '') + (part.state.output || '')}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          ''
        )}
      </ToolPartContainer>
    )
  } else if (assertToolGlob(part)) {
    return (
      <ToolPartContainer
        isLoading={part.state.status === 'running'}
        title={
          part.state.status === 'completed'
            ? part.state.input?.pattern
            : part.state.title
        }
        titlePrefix={part.tool}
      >
        {part.state.status === 'completed' && part.state.output?.length ? (
          <pre
            className=""
            dangerouslySetInnerHTML={{ __html: part.state.output }}
          />
        ) : (
          ''
        )}
      </ToolPartContainer>
    )
  }

  return (
    <ToolPartContainer
      isLoading={part.state.status === 'running'}
      title={part.state.title}
      titlePrefix={part.tool}
    >
      {part.state.status === 'completed' && part.state.output ? (
        <div className="prose-sm max-w-none">
          <Markdown>{part.state.output}</Markdown>
        </div>
      ) : (
        <div>tool: {part.tool} NOT_IMPLEMENTED!</div>
      )}
    </ToolPartContainer>
  )
}

export function TaskToolPart({ part }: { part: ITaskToolPart }) {
  const server = useContext(ServerContext)

  const childSessionTask =
    (part.state.status === 'completed' || part.state.status === 'running') &&
    (part.state.metadata.sessionId ||
      part.state?.metadata?.summary?.find((i) => i.sessionID)?.sessionID)

  return (
    <div className="relative">
      {childSessionTask && server ? (
        <Button
          variant={'ghost'}
          className="absolute top-0 right-0 -translate-y-full"
          asChild
        >
          <Link
            to="/servers/$serverId/$sessionId/chat"
            params={{
              serverId: server.identifier.toString(),
              sessionId: childSessionTask,
            }}
          >
            <Eye />
          </Link>
        </Button>
      ) : (
        ''
      )}

      {(part.state.status === 'completed' || part.state.status === 'running') &&
      part.state.metadata.summary?.length
        ? part.state.metadata.summary.map((taskStateSummary) => {
            return (
              <InlineToolPart
                part={taskStateSummary}
                key={taskStateSummary.id}
              />
            )
          })
        : ''}
    </div>
  )
}

export function InlineToolPart({ part }: ToolPartProps) {
  return (
    <div>
      {part.state.status === 'pending' && (
        <span className="text-destructive flex items-center sapce-x-1">
          <LoaderIcon className="size-3 animate-spin" />
          {part.tool} Pending
        </span>
      )}
      {part.state.status === 'error' && (
        <span className="text-destructive">
          {part.tool}: {part.state.error}
        </span>
      )}
      {part.state.status === 'running' && (
        <span className="flex items-center sapce-x-1">
          <LoaderIcon className="size-3 animate-spin" />
          {part.tool}: {part.state.title}
        </span>
      )}

      {part.state.status === 'completed' && (
        <span className="flex items-center sapce-x-1">
          {part.tool}:{' '}
          {(part.state as GenericCompleteStateTask)?.input?.description ||
            (part.state as GenericCompleteStateTask)?.metadata?.description ||
            (part.state as GenericCompleteStateTask)?.input?.pattern ||
            (part.state as GenericCompleteStateTask)?.title}
        </span>
      )}
    </div>
  )
}

// function

function ToolPartContainer({
  children,
  isLoading,
  title,
  titlePrefix,
}: {
  title?: string
  titlePrefix?: string
  isLoading: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border border-neutral-300 rounded p-4">
      <div className="flex items-center justify-start space-x-2">
        {isLoading && <LoaderIcon className="animate-spin" />}
        <span className="font-semibold mb-2">
          [TOOL] <span className="text-blue-800">{titlePrefix}</span> {title}
        </span>
      </div>
      {children}
    </div>
  )
}
