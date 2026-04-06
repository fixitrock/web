import { create } from 'zustand'

export interface AuthStoreState {
    logout: () => Promise<void>
    setLogout: (fn: () => Promise<void>) => void
}

export const useAuth = create<AuthStoreState>((set) => ({
    logout: async () => {},
    setLogout: (fn) => set({ logout: fn }),
}))
