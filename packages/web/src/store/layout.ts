import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Layout = 'grid' | 'list'

export interface LayoutStoreState {
    layout: Layout
    previousLayout: Layout | null
    lastUpdated: number
    setLayout: (layout: Layout, updateURL?: boolean) => void
    initializeFromCookie: () => void
    reset: () => void
    syncFromURL: () => void
    initializeGlobalSync: () => void
    syncFromLocalStorage: () => void
    subscribeToLocalStorage: () => void
}

const initialState: Pick<LayoutStoreState, 'layout' | 'previousLayout' | 'lastUpdated'> = {
    layout: 'grid',
    previousLayout: null,
    lastUpdated: 0,
}

export const useLayout = create<LayoutStoreState>()(
    devtools(
        (set, get) => ({
            ...initialState,
            setLayout: (layout, updateURL = false) => {
                const { layout: currentLayout } = get()

                if (updateURL && typeof window !== 'undefined') {
                    const url = new URL(window.location.href)
                    const timestamp = Date.now()

                    url.searchParams.set('layout', layout)
                    window.history.replaceState({}, '', url.toString())
                    document.cookie = `layout=${layout}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`
                    localStorage.setItem('layout', layout)
                    localStorage.setItem('layoutTimestamp', timestamp.toString())

                    window.dispatchEvent(
                        new CustomEvent('layoutChanged', {
                            detail: { layout, timestamp },
                        })
                    )
                }

                set({
                    layout,
                    previousLayout: currentLayout,
                    lastUpdated: Date.now(),
                })
            },
            initializeFromCookie: () => {
                if (typeof window === 'undefined') return

                const cookies = document.cookie.split(';')
                const layoutCookie = cookies.find((cookie) => cookie.trim().startsWith('layout='))

                if (layoutCookie) {
                    const layout = layoutCookie.split('=')[1] as Layout
                    if (layout === 'grid' || layout === 'list') {
                        set({ layout })
                    }
                }
            },
            reset: () => set(initialState),
            syncFromURL: () => {
                if (typeof window === 'undefined') return

                const url = new URL(window.location.href)
                const layoutParam = url.searchParams.get('layout') as Layout | null

                if (layoutParam === 'grid' || layoutParam === 'list') {
                    set({ layout: layoutParam })
                }
            },
            initializeGlobalSync: () => {
                if (typeof window === 'undefined') return

                window.addEventListener('popstate', () => {
                    get().syncFromURL()
                })

                window.addEventListener('layoutChanged', (event: Event) => {
                    const customEvent = event as CustomEvent<{ layout?: Layout }>
                    if (customEvent.detail?.layout) {
                        set({
                            layout: customEvent.detail.layout,
                            lastUpdated: Date.now(),
                        })
                    }
                })

                window.addEventListener('storage', (event: StorageEvent) => {
                    if (event.key === 'layout' && event.newValue) {
                        const layout = event.newValue as Layout
                        if (layout === 'grid' || layout === 'list') {
                            set({
                                layout,
                                lastUpdated: Date.now(),
                            })
                        }
                    }
                })
            },
            syncFromLocalStorage: () => {
                if (typeof window === 'undefined') return

                const layout = localStorage.getItem('layout') as Layout | null
                const timestamp = localStorage.getItem('layoutTimestamp')

                if (layout && (layout === 'grid' || layout === 'list')) {
                    const storedTimestamp = parseInt(timestamp || '0', 10)
                    const currentTimestamp = get().lastUpdated

                    if (storedTimestamp > currentTimestamp) {
                        set({
                            layout,
                            lastUpdated: storedTimestamp,
                        })
                    }
                }
            },
            subscribeToLocalStorage: () => {
                if (typeof window === 'undefined') return

                const originalSetItem = localStorage.setItem
                const originalRemoveItem = localStorage.removeItem

                localStorage.setItem = function (key: string, value: string) {
                    if (key === 'layout') {
                        window.dispatchEvent(
                            new CustomEvent('localStorageChanged', {
                                detail: { key, value, timestamp: Date.now() },
                            })
                        )
                    }

                    return originalSetItem.apply(this, [key, value])
                }

                localStorage.removeItem = function (key: string) {
                    if (key === 'layout') {
                        window.dispatchEvent(
                            new CustomEvent('localStorageChanged', {
                                detail: { key, value: null, timestamp: Date.now() },
                            })
                        )
                    }

                    return originalRemoveItem.apply(this, [key])
                }
            },
        }),
        { name: 'layout-store' }
    )
)

export const getCurrentLayout = () => useLayout.getState().layout
