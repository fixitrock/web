import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Layout = 'grid' | 'list'

interface LayoutState {
    layout: 'grid' | 'list'
    previousLayout: 'grid' | 'list' | null
    lastUpdated: number
}

interface LayoutActions {
    setLayout: (layout: 'grid' | 'list', updateURL?: boolean) => void
    initializeFromCookie: () => void
    reset: () => void
    syncFromURL: () => void
    initializeGlobalSync: () => void
    syncFromLocalStorage: () => void
    subscribeToLocalStorage: () => void
}

type LayoutStore = LayoutState & LayoutActions

const initialState: LayoutState = {
    layout: 'grid',
    previousLayout: null,
    lastUpdated: 0,
}

export const useLayout = create<LayoutStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setLayout: (layout, updateURL = false) => {
                const { layout: currentLayout } = get()

                if (updateURL && typeof window !== 'undefined') {
                    const url = new URL(window.location.href)

                    url.searchParams.set('layout', layout)
                    window.history.replaceState({}, '', url.toString())

                    document.cookie = `layout=${layout}; expires=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`
                    localStorage.setItem('layout', layout)
                    localStorage.setItem('layoutTimestamp', Date.now().toString())

                    window.dispatchEvent(
                        new CustomEvent('layoutChanged', {
                            detail: { layout, timestamp: Date.now() },
                        })
                    )
                }

                set({
                    layout: layout,
                    previousLayout: currentLayout,
                    lastUpdated: Date.now(),
                })
            },

            initializeFromCookie: () => {
                if (typeof window !== 'undefined') {
                    const cookies = document.cookie.split(';')
                    const layoutCookie = cookies.find((cookie) =>
                        cookie.trim().startsWith('layout=')
                    )

                    if (layoutCookie) {
                        const layout = layoutCookie.split('=')[1] as 'grid' | 'list'

                        if (layout === 'grid' || layout === 'list') {
                            set({ layout: layout })
                        }
                    }
                }
            },

            reset: () => set(initialState),

            syncFromURL: () => {
                if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href)
                    const layoutParam = url.searchParams.get('layout')

                    if (layoutParam) {
                        const layout = layoutParam as 'grid' | 'list'

                        if (layout === 'grid' || layout === 'list') {
                            set({ layout: layout })
                        }
                    }
                }
            },

            initializeGlobalSync: () => {
                if (typeof window !== 'undefined') {
                    window.addEventListener('popstate', () => {
                        get().syncFromURL()
                    })

                    window.addEventListener('layoutChanged', (event: Event) => {
                        const customEvent = event as CustomEvent

                        if (customEvent.detail?.layout) {
                            set({
                                layout: customEvent.detail.layout,
                                lastUpdated: Date.now(),
                            })
                        }
                    })

                    window.addEventListener('storage', (event: StorageEvent) => {
                        if (event.key === 'layout' && event.newValue) {
                            const layout = event.newValue as 'grid' | 'list'

                            if (layout === 'grid' || layout === 'list') {
                                set({
                                    layout: layout,
                                    lastUpdated: Date.now(),
                                })
                            }
                        }
                    })
                }
            },

            syncFromLocalStorage: () => {
                if (typeof window !== 'undefined') {
                    const layout = localStorage.getItem('layout') as 'grid' | 'list'
                    const timestamp = localStorage.getItem('layoutTimestamp')

                    if (layout && (layout === 'grid' || layout === 'list')) {
                        const storedTimestamp = parseInt(timestamp || '0')
                        const currentTimestamp = get().lastUpdated

                        if (storedTimestamp > currentTimestamp) {
                            set({
                                layout: layout,
                                lastUpdated: storedTimestamp,
                            })
                        }
                    }
                }
            },

            subscribeToLocalStorage: () => {
                if (typeof window !== 'undefined') {
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
                }
            },
        }),
        { name: 'layout-store' }
    )
)

export const getCurrentLayout = () => useLayout.getState().layout
