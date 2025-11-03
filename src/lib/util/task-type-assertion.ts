import type {
  ToolPart,
  ToolStateCompleted,
  ToolStateError,
  ToolStatePending,
  ToolStateRunning,
} from '../api/model'

interface ReadToolStateCompleted extends ToolStateCompleted {
  metadata: {
    preview?: string
  }
}

interface TaskToolStateCompleted extends ToolStateCompleted {
  metadata: {
    summary: Array<ToolPart>
    sessionId?: string
  }
}

interface TaskToolStateRunning extends ToolStateRunning {
  metadata: {
    summary: Array<ToolPart>
    sessionId?: string
  }
}

export interface EditToolStateCompleted extends ToolStateCompleted {
  input: {
    filePath?: string
    oldString?: string
    newString?: string
  }
}
export interface WriteToolStateCompleted extends ToolStateCompleted {
  input: {
    filePath?: string
    content?: string
  }
}

export interface BashToolStateCompleted extends ToolStateCompleted {
  input: {
    command?: string
    description?: string
    timeout?: number
  }
  metadata: {
    output?: string
    exit?: number
    description?: string
  }
}

export interface GlobToolStateCompleted extends ToolStateCompleted {
  input: {
    pattern?: string
  }
}

export interface GenericCompleteStateTask extends ToolStateCompleted {
  input: {
    command?: string
    description?: string
    timeout?: number
    pattern?: string
  }
  metadata: {
    output?: string
    exit?: number
    description?: string
  }
}

// export interface McpToolStateCompleted extends ToolStateCompleted {
//   output: string
// }

interface IReadToolPart extends ToolPart {
  state:
    | ToolStatePending
    | ToolStateRunning
    | ReadToolStateCompleted
    | ToolStateError
}
export interface ITaskToolPart extends Omit<ToolPart, 'state'> {
  state:
    | ToolStatePending
    | TaskToolStateRunning
    | TaskToolStateCompleted
    | ToolStateError
}

export interface IEditToolPart extends ToolPart {
  state:
    | ToolStatePending
    | ToolStateRunning
    | EditToolStateCompleted
    | ToolStateError
}

export interface IWriteToolPart extends ToolPart {
  state:
    | ToolStatePending
    | ToolStateRunning
    | WriteToolStateCompleted
    | ToolStateError
}
export interface IBashToolPart extends ToolPart {
  state:
    | ToolStatePending
    | ToolStateRunning
    | BashToolStateCompleted
    | ToolStateError
}

export interface IGlobToolPart extends ToolPart {
  state:
    | ToolStatePending
    | ToolStateRunning
    | GlobToolStateCompleted
    | ToolStateError
}

export const assertToolRead = (part: ToolPart): part is IReadToolPart => {
  return part.tool === 'read'
}

export const assertToolTask = (part: ToolPart): part is ITaskToolPart => {
  return part.tool === 'task'
}

export const assertToolEdit = (part: ToolPart): part is IEditToolPart => {
  return part.tool === 'edit'
}

export const assertToolWrite = (part: ToolPart): part is IWriteToolPart => {
  return part.tool === 'write'
}

export const assertToolMcp = (part: ToolPart): part is IWriteToolPart => {
  return !!part.tool?.length
}

export const assertToolBash = (part: ToolPart): part is IBashToolPart => {
  return part.tool === 'bash'
}

export const assertToolGlob = (part: ToolPart): part is IGlobToolPart => {
  return part.tool === 'glob'
}
