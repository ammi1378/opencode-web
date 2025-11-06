import type {
  EventMessagePartUpdated,
  EventMessageUpdated,
  EventSessionCreated,
  EventSessionUpdated,
  Session,
  SessionMessages200Item,
  TextPart,
} from './api/model'

export function upsertSession(
  sessions: Array<Session> | undefined,
  newSession: EventSessionCreated | EventSessionUpdated,
): Array<Session> {
  const newSessions = sessions ? [...sessions] : []

  if (newSession.type === 'session.created') {
    newSessions.unshift(newSession.properties.info)
    return newSessions
  } 

  for (let i = 0; i < newSessions.length; i++) {
    const currentSession = newSessions[i]
    if (currentSession.id === newSession.properties.info.id) {
      newSessions[i] = newSession.properties.info
      return newSessions
    }
  }


  return newSessions
}

export function upsertMessage(
  messages: Array<SessionMessages200Item>,
  newMessage: EventMessageUpdated,
): Array<SessionMessages200Item> {
  const newMessages = [...messages]
  let insertionIndex = newMessages.length

  for (let i = 0; i < newMessages.length; i++) {
    const currentMessage = newMessages[i]
    if (currentMessage.info.id === newMessage.properties.info.id) {
      newMessages[i] = { ...currentMessage, info: newMessage.properties.info }
      return newMessages
    }

    if (
      newMessage.properties.info.time.created < currentMessage.info.time.created
    ) {
      insertionIndex = i
    }
  }

  newMessages.splice(insertionIndex, 0, {
    info: newMessage.properties.info,
    parts: [],
  })

  return newMessages
}

export function upsertMessagPart(
  messages: Array<SessionMessages200Item>,
  newPart: EventMessagePartUpdated,
): Array<SessionMessages200Item> | undefined {
  const newMessages = [...messages]
  const messageToUpdateIndex = newMessages.findIndex(
    (msg) => msg.info.id === newPart.properties.part.messageID,
  )
  if (messageToUpdateIndex === -1) return undefined

  const messageToUpdate = newMessages.at(messageToUpdateIndex)!

  const messageToUpdateParts = [...messageToUpdate.parts]
  let insertionIndex = messageToUpdateParts.length

  for (let i = 0; i < messageToUpdateParts.length; i++) {
    const currentMessagePart = messageToUpdateParts[i]
    if (currentMessagePart.id === newPart.properties.part.id) {
      messageToUpdateParts[i] = newPart.properties.part
      newMessages[messageToUpdateIndex] = {
        ...messageToUpdate,
        parts: messageToUpdateParts,
      }
      // debugger
      return newMessages
    }

    if (
      ((newPart.properties.part as any as TextPart)?.time?.start ?? -Infinity) <
      ((currentMessagePart as TextPart)?.time?.start ?? Infinity)
      // currentMessagePart.info.time.created
    ) {
      insertionIndex = i
    }
  }

  messageToUpdateParts.splice(insertionIndex, 0, newPart.properties.part)
  newMessages[messageToUpdateIndex] = {
    ...messageToUpdate,
    parts: messageToUpdateParts,
  }
  return newMessages
}
