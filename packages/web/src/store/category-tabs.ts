import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CategoryTabsStoreState {
    activeCategory: string | null
    page: number
    search: string
    categoryTouched: boolean
    searchTouched: boolean
    isFetchingNextPage: boolean
    setActiveCategory: (category: string | null, username?: string) => void
    handleCategoryChange: (key: string, username: string) => void
    setPage: (page: number) => void
    setSearch: (search: string, username?: string) => void
    setIsFetchingNextPage: (value: boolean) => void
    updateProductsUrl: (
        username: string,
        page: number,
        category?: string | null,
        search?: string
    ) => void
}

const normalizeCategory = (value?: string | null) => {
    const normalized = value?.trim()
    if (!normalized || normalized.toLowerCase() === 'all') return null

    return normalized
}

const normalizeStoreCategory = (value?: string | null) => {
    const normalized = value?.trim()
    if (!normalized || normalized.toLowerCase() === 'all') return 'all'

    return normalized
}

const normalizePage = (value: number) => {
    if (!Number.isFinite(value) || value < 1) return 1

    return Math.floor(value)
}

const normalizeSearch = (value?: string | null) => value?.trim() || ''

const updateClientMetadata = (category: string | null, search: string, page: number) => {
    if (typeof document === 'undefined') return

    const titleParts = document.title.split(' - ')
    const owner = titleParts.length > 1 ? titleParts[titleParts.length - 1] : document.title
    const heading =
        category || (search ? `Search: ${search}` : page > 1 ? `Products Page ${page}` : 'Products')
    const nextTitle = owner ? `${heading} - ${owner}` : heading

    document.title = nextTitle

    const description = `Browse ${owner || 'products'}${category ? ` category: ${category}` : ''}${search ? ` search: "${search}"` : ''}${page > 1 ? ` page ${page}` : ''}.`
    const setMeta = (selector: string, content: string) => {
        const el = document.querySelector(selector)
        if (el) {
            el.setAttribute('content', content)
        }
    }

    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', nextTitle)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[name="twitter:title"]', nextTitle)
    setMeta('meta[name="twitter:description"]', description)
}

const getProductsUrlState = () => {
    if (typeof window === 'undefined') {
        return {
            isProductsTab: false,
            category: 'all' as string,
            page: 1,
            search: '',
        }
    }

    const url = new URL(window.location.href)
    const tab = url.searchParams.get('tab')?.toLowerCase()

    if (tab !== 'products') {
        return {
            isProductsTab: false,
            category: 'all' as string,
            page: 1,
            search: '',
        }
    }

    return {
        isProductsTab: true,
        category: normalizeStoreCategory(url.searchParams.get('category')),
        page: normalizePage(Number(url.searchParams.get('page') || 1)),
        search: normalizeSearch(url.searchParams.get('search')),
    }
}

export const useCategoryTabsStore = create<CategoryTabsStoreState>()(
    persist(
        (set, get) => ({
            activeCategory: getProductsUrlState().category,
            page: getProductsUrlState().page,
            search: getProductsUrlState().search,
            categoryTouched: false,
            searchTouched: false,
            isFetchingNextPage: false,
            updateProductsUrl: (username, page, category, search) => {
                if (typeof window === 'undefined' || !username) return

                const nextPage = normalizePage(page)
                const nextCategory = normalizeCategory(category ?? get().activeCategory)
                const nextSearch = normalizeSearch(search ?? get().search)
                const url = new URL(window.location.href)
                const params = new URLSearchParams()

                url.pathname = `/@${username}`
                params.set('tab', 'products')

                if (nextPage > 1) params.set('page', String(nextPage))
                if (nextCategory) params.set('category', nextCategory)
                if (nextSearch) params.set('search', nextSearch)

                window.history.replaceState({}, '', `${url.pathname}?${params.toString()}`)
                updateClientMetadata(nextCategory, nextSearch, nextPage)
            },
            setActiveCategory: (category, username) => {
                const nextCategory = normalizeStoreCategory(category)
                set({ activeCategory: nextCategory, page: 1, categoryTouched: true })

                if (username) {
                    get().updateProductsUrl(username, 1, nextCategory)
                }
            },
            handleCategoryChange: (key, username) => {
                const nextCategory = normalizeStoreCategory(key)
                set({
                    activeCategory: nextCategory,
                    page: 1,
                    categoryTouched: true,
                    isFetchingNextPage: false,
                })
                get().updateProductsUrl(username, 1, nextCategory)
            },
            setPage: (page) => set({ page: normalizePage(page) }),
            setSearch: (search, username) => {
                set({ search, page: 1, searchTouched: true })

                if (username) {
                    get().updateProductsUrl(username, 1, undefined, search)
                }
            },
            setIsFetchingNextPage: (value) => set({ isFetchingNextPage: value }),
        }),
        {
            name: 'category-tabs-storage',
            partialize: (state) => ({ activeCategory: state.activeCategory }),
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<CategoryTabsStoreState> | undefined
                const urlState = getProductsUrlState()

                return {
                    ...currentState,
                    ...(persisted ?? {}),
                    activeCategory: urlState.isProductsTab
                        ? urlState.category
                        : normalizeStoreCategory(persisted?.activeCategory),
                    page: urlState.isProductsTab ? urlState.page : 1,
                    search: urlState.isProductsTab ? urlState.search : '',
                    categoryTouched: false,
                    searchTouched: false,
                    isFetchingNextPage: false,
                }
            },
        }
    )
)
