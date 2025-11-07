import { create } from 'zustand'

// Define your store
interface Session {
  status: 'updating' | 'idle' | 'error'
}

interface SessionStore {
  sessions: Record<string, Session>
  updateSessionStatus: (id: string, status: Session['status']) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: {},
  updateSessionStatus: (id, status) =>
    set((state) => {
      if (state.sessions[id]?.status === status) {
        return state
      }

      return {
        sessions: {
          ...state.sessions,
          [id]: { ...state.sessions[id], status },
        },
      }
    }),
}))
