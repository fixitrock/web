import { create } from 'zustand'

export interface EventStoreState {
    refreshVersion: number
    trigger: () => void
}

export const useEvent = create<EventStoreState>((set) => ({
    refreshVersion: 0,
    trigger: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
}))
