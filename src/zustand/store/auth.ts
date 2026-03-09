import { create } from 'zustand'

interface GlobalState {
    logout: () => Promise<void>
    setLogout: (fn: () => Promise<void>) => void
}

export const useAuth = create<GlobalState>((set) => ({
    logout: async () => {},
    setLogout: (fn) => set({ logout: fn }),
}))
