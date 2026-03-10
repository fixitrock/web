import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CategoryTabsState {
    activeCategory: string | null
    setActiveCategory: (category: string | null) => void
    handleCategoryChange: (key: string) => void
}

export const useCategoryTabsStore = create<CategoryTabsState>()(
    persist(
        (set) => ({
            activeCategory: 'all',
            tabRef: null,

            setActiveCategory: (category) => {
                set({ activeCategory: category })
            },

            handleCategoryChange: (key) => {
                set({ activeCategory: key })
            },
        }),
        {
            name: 'category-tabs-storage',
            partialize: (state) => ({ activeCategory: state.activeCategory }),
        }
    )
)
