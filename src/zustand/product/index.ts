import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { create } from 'zustand'

interface ProductStore {
    activeCategory: string
    setActiveCategory: (category: string) => void
    handleCategoryChange: (key: string, username: string, router: AppRouterInstance) => void
    scrollActiveTabIntoView: (
        container: HTMLDivElement | null,
        activeCategory: string,
        selected: string
    ) => void
}

export const useProductStore = create<ProductStore>((set, get) => ({
    activeCategory: 'all',
    setActiveCategory: (category) => set({ activeCategory: category }),
    handleCategoryChange: (key: string, username: string, router: AppRouterInstance) => {
        set({ activeCategory: key })
        if (key === 'all') {
            router.push(`/@${username}/products`)
        } else {
            router.push(`/@${username}/products?category=${encodeURIComponent(key)}`)
        }
    },
    scrollActiveTabIntoView: (
        container: HTMLDivElement | null,
        activeCategory: string,
        selected: string
    ) => {
        if (!container) return

        const activeTab = container.querySelector<HTMLElement>(
            `[data-key="${CSS.escape(activeCategory)}"]`
        )

        if (activeTab) {
            activeTab.scrollIntoView({
                behavior: selected === activeCategory ? 'instant' : 'smooth',
                block: 'nearest',
                inline: 'center',
            })
        }
    },
}))
