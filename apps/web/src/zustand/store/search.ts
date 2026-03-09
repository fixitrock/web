import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { Navigation, Navigations } from '@/components/search/type'
import { tabConfigs } from '@/config/tabs'
import { HeyYou } from '@/lib/utils'
import { TransactionItem } from '@/types/transaction'

interface NavigationGroup {
    heading: string
    navigationItems: Navigation[]
}

type SearchState = {
    query: string
    setQuery: (value: string) => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void

    ref: React.RefObject<HTMLDivElement>
    bounce: () => void

    page: string | null
    setPage: (id: string | null) => void

    tab: string
    setTab: (tab: string) => void

    onSelect: (
        item: Navigation,
        router?: { push: (href: string) => void },
        setTheme?: (theme: string) => void
    ) => void

    onKeyDown: (e: React.KeyboardEvent) => void

    shouldFilter: boolean
    setShouldFilter: (v: boolean) => void

    dynamicNavigations: Record<string, Navigations>
    setDynamicNavigations: (lists: Record<string, Navigations>) => void

    getNavigationGroups: () => NavigationGroup[]
    getCurrentPageItems: () => Navigation[]
    heading: () => string | null
    isPageMode: () => boolean

    expandedOrderId: string | null
    setExpandedOrderId: (id: string | null) => void

    selectedTransaction: TransactionItem | null
    setSelectedTransaction: (transaction: TransactionItem | null) => void

    greeting: string
    refreshGreeting: (name?: string | null) => void
}

export const useSearchStore = create<SearchState>()(
    devtools(
        (set, get) => {
            const ref = React.createRef<HTMLDivElement>()

            const filterNavigations = (
                list: Navigations,
                query: string,
                shouldFilter: boolean
            ): Navigations => {
                if (shouldFilter || !query) return list

                const lowerQuery = query.toLowerCase()
                const seenIds = new Set<string>()

                const matches = (nav: Navigation): boolean => {
                    if (nav.title.toLowerCase().includes(lowerQuery)) return true
                    if (nav.description && nav.description.toLowerCase().includes(lowerQuery))
                        return true
                    if (
                        nav.keywords &&
                        nav.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
                    )
                        return true
                    if (
                        nav.shortcut &&
                        nav.shortcut.some((s) => s.toLowerCase().includes(lowerQuery))
                    )
                        return true

                    return false
                }

                const recursiveFilter = (items: Navigations): Navigations => {
                    return items
                        .map((nav) => {
                            const filteredChildren = nav.children
                                ? recursiveFilter(nav.children)
                                : undefined

                            return { ...nav, children: filteredChildren }
                        })
                        .filter(
                            (nav) =>
                                !seenIds.has(nav.id) &&
                                (matches(nav) || (nav.children && nav.children.length > 0))
                        )
                        .map((nav) => {
                            seenIds.add(nav.id)

                            return nav
                        })
                }

                return recursiveFilter(list)
            }

            return {
                ref,

                query: '',
                setQuery: (value) => set({ query: value }),

                isOpen: false,
                onClose: () => set({ isOpen: false, selectedTransaction: null }),
                onOpen: () => set({ isOpen: true }),

                expandedOrderId: null,
                setExpandedOrderId: (id) => set({ expandedOrderId: id }),

                selectedTransaction: null,
                setSelectedTransaction: (transaction) =>
                    set({ selectedTransaction: transaction }, false, 'setSelectedTransaction'),

                greeting: HeyYou(),
                refreshGreeting: (name) =>
                    set(
                        (state) => ({
                            greeting: HeyYou(name, state.greeting),
                        }),
                        false,
                        'refreshGreeting'
                    ),

                bounce: () => {
                    if (ref.current) {
                        ref.current.classList.remove('bounce')
                        void ref.current.offsetWidth
                        ref.current.classList.add('bounce')
                    }
                },

                page: null,
                setPage: (id) => set({ page: id, expandedOrderId: null }, false, 'setPages'),

                tab: 'actions',
                setTab: (tab) => {
                    const config = tabConfigs.find((t) => t.key === tab)
                    set(
                        {
                            tab,
                            expandedOrderId: null,
                            selectedTransaction: null,
                            shouldFilter: config ? config.shouldFilter : get().shouldFilter,
                        },
                        false,
                        'setTab'
                    )
                },

                onSelect: (item, router, setTheme) => {
                    if (item.action?.type === 'tab' && item.action.value)
                        get().setTab(item.action.value)
                    if (item.action?.type === 'section' && item.children) {
                        get().setPage(item.id)
                        get().bounce()
                    } else if (item.href && router) {
                        router.push(item.href)
                        get().onClose()
                    } else if (item.action?.type === 'theme' && setTheme) {
                        setTheme(item.action.value)
                        get().onClose()
                    }
                },

                onKeyDown: (event: KeyboardEvent) => {
                    const {
                        page,
                        setPage,
                        bounce,
                        query,
                        isOpen,
                        selectedTransaction,
                        setSelectedTransaction,
                    } = get()

                    if (!isOpen) return

                    switch (event.key) {
                        case 'Backspace':
                        case 'ArrowLeft':
                            if (selectedTransaction && query === '') {
                                event.preventDefault()
                                setSelectedTransaction(null)
                                bounce()
                                return
                            }

                            if (page && query === '') {
                                event.preventDefault()
                                setPage(null)
                                bounce()
                            } else if (!page && query.length === 0) {
                                bounce()
                            }
                            break
                    }
                },

                shouldFilter: true,
                setShouldFilter: (v) => set({ shouldFilter: v }),

                dynamicNavigations: {},
                setDynamicNavigations: (lists: Record<string, Navigations>) => {
                    set({ dynamicNavigations: { ...lists } })
                },

                isPageMode: () => get().page !== null || get().selectedTransaction !== null,

                getCurrentPageItems: () => {
                    const { page, dynamicNavigations } = get()

                    if (!page || !dynamicNavigations) return []

                    const allItems = Object.values(dynamicNavigations).flat()
                    const currentPageItem = allItems.find((item) => item.id === page)

                    return currentPageItem?.children || []
                },

                heading: () => {
                    const { page, dynamicNavigations, tab } = get()

                    if (!page || !dynamicNavigations) {
                        if (tab === 'space') {
                            return 'Search device or model (e.g. V9, PD1730)'
                        }
                        if (tab && tab !== 'actions') {
                            return `Search in ${tab.charAt(0).toUpperCase() + tab.slice(1)} . . .`
                        }

                        return null
                    }

                    const allItems = Object.values(dynamicNavigations).flat()
                    const currentPageItem = allItems.find((item) => item.id === page)

                    return currentPageItem?.title || null
                },

                getNavigationGroups: () => {
                    const { query, page, dynamicNavigations, shouldFilter } = get()

                    if (!dynamicNavigations) return []

                    // Page mode
                    if (page) {
                        const items = get().getCurrentPageItems()

                        return [
                            {
                                heading: get().heading() || '',
                                navigationItems: filterNavigations(items, query, shouldFilter),
                            },
                        ]
                    }

                    // Normal / grouped mode
                    const groups: NavigationGroup[] = []
                    const addedIds = new Set<string>()

                    Object.entries(dynamicNavigations).forEach(([heading, items]) => {
                        const filteredItems = filterNavigations(items, query, shouldFilter)
                        const uniqueItems: Navigation[] = []

                        filteredItems.forEach((item) => {
                            if (!addedIds.has(item.id)) {
                                uniqueItems.push(item)
                                addedIds.add(item.id)
                            }
                            if (query.trim() && item.children) {
                                item.children.forEach((child) => {
                                    if (!addedIds.has(child.id)) {
                                        uniqueItems.push(child)
                                        addedIds.add(child.id)
                                    }
                                })
                            }
                        })

                        if (uniqueItems.length > 0) {
                            groups.push({ heading, navigationItems: uniqueItems })
                        }
                    })

                    return groups
                },
            }
        },
        { name: 'search-store' }
    )
)
