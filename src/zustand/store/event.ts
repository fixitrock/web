import { create } from 'zustand'

interface Event {
    refreshVersion: number
    trigger: () => void
}

export const useEvent = create<Event>((set) => ({
    refreshVersion: 0,
    trigger: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
}))
