import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Drive, DriveItem } from '../types/drive'

export interface DriveStoreState {
    children: DriveItem[]
    nextPage: string | undefined
    currentSpace: string | undefined
    status: 'idle' | 'loading' | 'success' | 'error' | 'empty' | 'notFound'
    hasMore: boolean
    totalLoaded: number
    error: string | null
    loading: boolean
    loadingMore: boolean
    setChildren: (children: DriveItem[]) => void
    initialize: (data: Drive, space?: string) => void
    updatePagination: (response: Drive) => void
    appendItems: (newItems: DriveItem[]) => void
    clearItems: () => void
    setLoading: (loading: boolean) => void
    setLoadingMore: (loadingMore: boolean) => void
    setStatus: (status: DriveStoreState['status']) => void
    setError: (error: string | null) => void
    setNextPage: (nextPage: string | undefined) => void
    setHasMore: (hasMore: boolean) => void
    cleanupDuplicates: () => void
    reset: () => void
}

const initialState: Omit<
    DriveStoreState,
    | 'setChildren'
    | 'initialize'
    | 'updatePagination'
    | 'appendItems'
    | 'clearItems'
    | 'setLoading'
    | 'setLoadingMore'
    | 'setStatus'
    | 'setError'
    | 'setNextPage'
    | 'setHasMore'
    | 'cleanupDuplicates'
    | 'reset'
> = {
    children: [],
    nextPage: undefined,
    currentSpace: undefined,
    status: 'idle',
    hasMore: false,
    totalLoaded: 0,
    error: null,
    loading: false,
    loadingMore: false,
}

export const useDriveStore = create<DriveStoreState>()(
    devtools(
        (set, get) => ({
            ...initialState,
            setChildren: (children) => set({ children }),
            initialize: (data, space) => {
                if (!data?.value) {
                    set({ ...initialState, status: 'error', error: 'Invalid data' })
                    return
                }

                const { value, status, '@odata.nextLink': nextPage } = data
                const currentState = get()
                const uniqueChildren = value.filter(
                    (item, index, self) => index === self.findIndex((candidate) => candidate.id === item.id)
                )

                if (space && currentState.currentSpace !== space) {
                    set({
                        children: uniqueChildren,
                        nextPage,
                        currentSpace: space,
                        status: status || 'success',
                        hasMore: !!nextPage,
                        totalLoaded: uniqueChildren.length,
                        error: null,
                        loading: false,
                        loadingMore: false,
                    })

                    return
                }

                if (currentState.children.length === 0) {
                    set({
                        children: uniqueChildren,
                        nextPage,
                        currentSpace: space || currentState.currentSpace,
                        status: status || 'success',
                        hasMore: !!nextPage,
                        totalLoaded: uniqueChildren.length,
                        error: null,
                        loading: false,
                        loadingMore: false,
                    })
                } else {
                    set({
                        status: status || 'success',
                        error: null,
                        loading: false,
                        loadingMore: false,
                    })
                }
            },
            updatePagination: (response) => {
                if (!response?.value) return

                const { value, '@odata.nextLink': nextPage } = response
                const { children } = get()
                const newItems = value.filter(
                    (newItem) => !children.some((existingItem) => existingItem.id === newItem.id)
                )

                set({
                    children: [...children, ...newItems],
                    nextPage,
                    hasMore: !!nextPage,
                    totalLoaded: children.length + newItems.length,
                    loadingMore: false,
                })
            },
            appendItems: (newItems) => {
                const { children } = get()
                const uniqueNewItems = newItems.filter(
                    (newItem) => !children.some((existingItem) => existingItem.id === newItem.id)
                )

                set({
                    children: [...children, ...uniqueNewItems],
                    totalLoaded: children.length + uniqueNewItems.length,
                })
            },
            clearItems: () => set({ children: [], totalLoaded: 0 }),
            setLoading: (loading) => set({ loading }),
            setLoadingMore: (loadingMore) => set({ loadingMore }),
            setStatus: (status) => set({ status }),
            setError: (error) => set({ error }),
            setNextPage: (nextPage) => set({ nextPage }),
            setHasMore: (hasMore) => set({ hasMore }),
            cleanupDuplicates: () => {
                const { children } = get()
                const uniqueItems = children.filter(
                    (item, index, self) => index === self.findIndex((candidate) => candidate.id === item.id)
                )

                set({ children: uniqueItems })
            },
            reset: () => set(initialState),
        }),
        { name: 'drive-store' }
    )
)
