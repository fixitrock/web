import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Navigation, Navigations } from '../types/navigation'
import type { TransactionItem } from '../types/transaction'
import { HeyYou } from '../utils'

export type SearchTabConfig = {
    key: string
    shouldFilter: boolean
}

export interface SearchNavigationGroup {
    heading: string
    navigationItems: Navigation[]
}

export interface SearchStoreState {
    query: string
    setQuery: (value: string) => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    ref: React.RefObject<HTMLDivElement | null>
    bounce: () => void
    page: string | null
    setPage: (id: string | null) => void
    tab: string
    setTab: (tab: string) => void
    tabConfigs: SearchTabConfig[]
    setTabConfigs: (configs: SearchTabConfig[]) => void
    onSelect: (
        item: Navigation,
        router?: { push: (href: string) => void },
        setTheme?: (theme: string) => void
    ) => void
    onKeyDown: (event: KeyboardEvent | React.KeyboardEvent) => void
    shouldFilter: boolean
    setShouldFilter: (value: boolean) => void
    dynamicNavigations: Record<string, Navigations>
    setDynamicNavigations: (lists: Record<string, Navigations>) => void
    getNavigationGroups: () => SearchNavigationGroup[]
    getCurrentPageItems: () => Navigation[]
    heading: () => string | null
    isPageMode: () => boolean
    expandedOrderId: string | null
    setExpandedOrderId: (id: string | null) => void
    selectedTransaction: TransactionItem | null
    setSelectedTransaction: (transaction: TransactionItem | null) => void
    transactionSeller: boolean
    setTransactionSeller: (value: boolean) => void
    greeting: string
    refreshGreeting: (name?: string | null) => void
}

const DEFAULT_TAB_CONFIGS: SearchTabConfig[] = [{ key: 'actions', shouldFilter: true }]

export const useSearchStore = create<SearchStoreState>()(
    devtools(
        (set, get) => {
            const ref = React.createRef<HTMLDivElement>()
            const INITIAL_GREETING = 'What do you need? . . .'

            const filterNavigations = (
                list: Navigations,
                query: string,
                shouldFilter: boolean
            ): Navigations => {
                if (shouldFilter || !query) return list

                const lowerQuery = query.toLowerCase()
                const seenIds = new Set<string>()

                const matches = (navigation: Navigation) => {
                    if (navigation.title.toLowerCase().includes(lowerQuery)) return true
                    if (navigation.description?.toLowerCase().includes(lowerQuery)) return true
                    if (navigation.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))) {
                        return true
                    }
                    if (navigation.shortcut?.some((shortcut) => shortcut.toLowerCase().includes(lowerQuery))) {
                        return true
                    }

                    return false
                }

                const recursiveFilter = (items: Navigations): Navigations =>
                    items
                        .map((navigation) => ({
                            ...navigation,
                            children: navigation.children ? recursiveFilter(navigation.children) : undefined,
                        }))
                        .filter(
                            (navigation) =>
                                !seenIds.has(navigation.id) &&
                                (matches(navigation) || Boolean(navigation.children?.length))
                        )
                        .map((navigation) => {
                            seenIds.add(navigation.id)
                            return navigation
                        })

                return recursiveFilter(list)
            }

            return {
                ref,
                query: '',
                setQuery: (value) => set({ query: value }),
                isOpen: false,
                onClose: () => set({ isOpen: false, selectedTransaction: null, transactionSeller: false }),
                onOpen: () => set({ isOpen: true }),
                page: null,
                setPage: (id) => set({ page: id, expandedOrderId: null }, false, 'setPage'),
                tab: 'actions',
                tabConfigs: DEFAULT_TAB_CONFIGS,
                setTabConfigs: (tabConfigs) => set({ tabConfigs }),
                setTab: (tab) => {
                    const config = get().tabConfigs.find((item) => item.key === tab)

                    set(
                        {
                            tab,
                            expandedOrderId: null,
                            selectedTransaction: null,
                            transactionSeller: false,
                            shouldFilter: config ? config.shouldFilter : get().shouldFilter,
                        },
                        false,
                        'setTab'
                    )
                },
                onSelect: (item, router, setTheme) => {
                    if (item.action?.type === 'tab' && item.action.value) {
                        get().setTab(item.action.value)
                    }

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
                onKeyDown: (event) => {
                    const { page, setPage, bounce, query, isOpen, selectedTransaction, setSelectedTransaction } =
                        get()

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

                            if (page && query.length === 0) {
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
                setShouldFilter: (value) => set({ shouldFilter: value }),
                dynamicNavigations: {},
                setDynamicNavigations: (lists) => {
                    set({ dynamicNavigations: { ...lists } })
                },
                getCurrentPageItems: () => {
                    const { page, dynamicNavigations } = get()
                    if (!page) return []

                    const allItems = Object.values(dynamicNavigations).flat()
                    const currentPageItem = allItems.find((item) => item.id === page)
                    return currentPageItem?.children || []
                },
                getNavigationGroups: () => {
                    const { query, page, dynamicNavigations, shouldFilter } = get()
                    if (!dynamicNavigations) return []

                    if (page) {
                        const items = get().getCurrentPageItems()
                        return [
                            {
                                heading: get().heading() || '',
                                navigationItems: filterNavigations(items, query, shouldFilter),
                            },
                        ]
                    }

                    const groups: SearchNavigationGroup[] = []
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
                isPageMode: () => get().page !== null || get().selectedTransaction !== null,
                expandedOrderId: null,
                setExpandedOrderId: (id) => set({ expandedOrderId: id }),
                selectedTransaction: null,
                setSelectedTransaction: (transaction) =>
                    set(
                        {
                            selectedTransaction: transaction,
                            transactionSeller: false,
                        },
                        false,
                        'setSelectedTransaction'
                    ),
                transactionSeller: false,
                setTransactionSeller: (value) => set({ transactionSeller: value }, false, 'setTransactionSeller'),
                greeting: INITIAL_GREETING,
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
            }
        },
        { name: 'search-store' }
    )
)
