// hooks/useSSEStream.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Event, Session, SessionMessages200Item } from '@/lib/api/model'
import {
  getEventSubscribeQueryKey,
  getSessionListQueryKey,
  getSessionListQueryOptions,
  getSessionMessagesQueryKey,
} from '@/lib/api/default/default'
import {
  upsertMessagPart,
  upsertMessage,
  upsertSession,
} from '@/lib/update-center'
import { useSessionStore } from '@/integrations/zustand/session'

interface UseSSEStreamOptions {
  directory?: string
  endpoint: string
  queryKey: Array<string>
  maxItems?: number // Limit number of items kept in memory
  enabled?: boolean
}

interface UseSSEStreamReturn {
  data: Array<Event>
  isConnected: boolean
  error: string | null
  reconnect: () => void
  clear: () => void
}
const batch = !true
const batchSize = 20
const shouldLog = false
const logger = (msg: any) => {
  if (shouldLog) {
    console.log(msg)
  }
}

export function useSSEStream<T = any>({
  endpoint,
  maxItems = 100,
  enabled = true,
}: UseSSEStreamOptions): UseSSEStreamReturn {
  const updateSessionStatus = useSessionStore(
    (state) => state.updateSessionStatus,
  )

  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryKey = getEventSubscribeQueryKey({})

  const { data = [] } = useQuery<Array<Event>>({
    queryKey,
    queryFn: () => [],
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
  })

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(endpoint)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      logger('✅ SSE Connected')
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const newItem = JSON.parse(event.data)

        queryClient.setQueryData<Array<T>>(queryKey, (oldData = []) => {
          const newData = [...oldData, newItem]
          return newData.slice(0, maxItems)
        })
      } catch (err) {
        console.error('Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('❌ SSE Error:', err)
      setIsConnected(false)
      setError('Connection failed')
    }

    return eventSource
  }

  useEffect(() => {
    if (!enabled) return

    const eventSource = connect()

    return () => {
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [endpoint, enabled])

  const reconnect = () => {
    connect()
  }

  const clear = (preservedEvents: Array<Event> = []) => {
    queryClient.setQueryData<Array<Event>>(queryKey, preservedEvents)
  }

  const batchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const cancelTimeout = useCallback(() => {
    if (!batchTimeoutRef?.current) return
    logger('[OC_STATE]: Timeout removed!')

    clearTimeout(batchTimeoutRef?.current)
    batchTimeoutRef.current = undefined
  }, [batchTimeoutRef])

  // const [updateQueue, setUupdateQueue] = useState<Event[]>([])
  useEffect(() => {
    queryClient.setQueryData(['activity-log'], [])

    if (batch) {
      logger('[OC_STATE]: Batch updates recieved!')
      const updateQueue = data

      logger({ updateQueue, data })

      if (updateQueue.length >= batchSize) {
        logger('[OC_STATE]: Applying batch updates - [max q size]!')
        cancelTimeout()
        updateOpenCodeState(data)
      } else {
        cancelTimeout()
        logger('[OC_STATE]: Timeout created!')
        batchTimeoutRef.current = setTimeout(() => {
          logger('[OC_STATE]: Applying batch updates - [timeout]!')
          updateOpenCodeState(data)
        }, 300)
      }
    } else {
      logger('[OC_STATE]: Single Update recieved!')
      const currentEvent = data.at(0)
      if (currentEvent) {
        logger('[OC_STATE]: Applying single update!')
        updateOpenCodeState(data)
      }
    }
  }, [data])

  const updateOpenCodeState = useCallback(
    (events: Array<Event>) => {
      const onholdEvents: Array<Event> = []
      // const events = updateQueue.current
      logger('[OC_STATE]: Updates started!')
      events.forEach((ocEvent) => {
        // updateSession
        let updatingSessionId: string | undefined = undefined
        if (ocEvent.type === 'message.updated') {
          if (ocEvent.properties.info.role === 'assistant') {
            updatingSessionId = ocEvent.properties.info.sessionID
          }
          queryClient.setQueryData(
            getSessionMessagesQueryKey(ocEvent.properties.info.sessionID, {}),
            (val: Array<SessionMessages200Item> | undefined) => {
              if (val) {
                const newState = upsertMessage(val, ocEvent)

                if (!newState) {
                  onholdEvents.push(ocEvent)
                }
                return newState
              }
            },
          )
        } else if (ocEvent.type === 'message.part.updated') {
          // updatingSessionId = ocEvent.properties.part.sessionID
          queryClient.setQueryData(
            getSessionMessagesQueryKey(ocEvent.properties.part.sessionID, {}),
            (val: Array<SessionMessages200Item> | undefined) => {
              if (val) {
                const newState = upsertMessagPart(val, ocEvent)

                if (!newState) {
                  onholdEvents.push(ocEvent)
                }

                return newState
              }
            },
          )
        } else if (
          ocEvent.type === 'session.updated' ||
          ocEvent.type === 'session.created'
        ) {
          // updatingSessionId = ocEvent.properties.info.id
          queryClient.setQueryData(
            getSessionListQueryKey({}),
            (val: Session[] | undefined) => {
              const newState = upsertSession(val, ocEvent)
              if (!newState) {
                onholdEvents.push(ocEvent)
              }

              return newState
            },
          )
          getSessionListQueryOptions({})
        } else if (ocEvent.type === 'session.idle') {
          updateSessionStatus(ocEvent.properties.sessionID, 'idle')
        } else if (
          ocEvent.type === 'session.error' &&
          ocEvent.properties?.sessionID
        ) {
          updateSessionStatus(ocEvent.properties.sessionID, 'error')
        }

        if (updatingSessionId) {
          updateSessionStatus(updatingSessionId, 'updating')
        }
      })

      logger('[OC_STATE]: Updates cleared!')
      clear(onholdEvents)
    },
    [queryClient, clear, updateSessionStatus],
  )

  return {
    data,
    isConnected,
    error,
    reconnect,
    clear,
  }
}
