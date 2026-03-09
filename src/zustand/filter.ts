import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type FilterValues = {
    categories: string[]
    brands: string[]
    status: string[]
    columns: string[]
}

type ActiveFilter = {
    id: string
    label: string
    onRemove: () => void
}

type FilterStore = {
    values: FilterValues
    toggleCategory: (category: string) => void
    toggleBrand: (brand: string) => void
    toggleStatus: (status: string) => void
    toggleColumn: (column: string) => void
    reset: () => void
    clearCategory: () => void
    clearBrand: () => void
    clearStatus: () => void
    getActiveFilters: (
        status: { key: string; label: string }[],
        columns: { key: string; label: string }[]
    ) => ActiveFilter[]
}

const initial: FilterValues = {
    categories: [],
    brands: [],
    status: [],
    columns: [],
}

export const useProductFilterStore = create<FilterStore>()(
    persist(
        (set, get) => ({
            values: initial,
            toggleCategory: (category) =>
                set((s) => ({
                    values: {
                        ...s.values,
                        categories: s.values.categories.includes(category)
                            ? s.values.categories.filter((c) => c !== category)
                            : [...s.values.categories, category],
                    },
                })),
            toggleBrand: (brand) =>
                set((s) => ({
                    values: {
                        ...s.values,
                        brands: s.values.brands.includes(brand)
                            ? s.values.brands.filter((b) => b !== brand)
                            : [...s.values.brands, brand],
                    },
                })),
            toggleStatus: (status) =>
                set((s) => ({
                    values: {
                        ...s.values,
                        status: s.values.status.includes(status)
                            ? s.values.status.filter((st) => st !== status)
                            : [...s.values.status, status],
                    },
                })),
            toggleColumn: (column) =>
                set((s) => ({
                    values: {
                        ...s.values,
                        columns: s.values.columns.includes(column)
                            ? s.values.columns.filter((c) => c !== column)
                            : [...s.values.columns, column],
                    },
                })),
            reset: () => set({ values: initial }),
            clearCategory: () => set((s) => ({ values: { ...s.values, categories: [] } })),
            clearBrand: () => set((s) => ({ values: { ...s.values, brands: [] } })),
            clearStatus: () => set((s) => ({ values: { ...s.values, status: [] } })),
            getActiveFilters: (status, columns) => {
                const { values, toggleCategory, toggleBrand, toggleStatus, toggleColumn } = get()
                const filters: ActiveFilter[] = []

                // Add category filters
                values.categories.forEach((category) => {
                    filters.push({
                        id: `category-${category}`,
                        label: category,
                        onRemove: () => toggleCategory(category),
                    })
                })

                // Add brand filters
                values.brands.forEach((brand) => {
                    filters.push({
                        id: `brand-${brand}`,
                        label: brand,
                        onRemove: () => toggleBrand(brand),
                    })
                })

                values.status.forEach((statusKey) => {
                    const statusOption = status.find((option) => option.key === statusKey)

                    if (statusOption) {
                        filters.push({
                            id: `status-${statusKey}`,
                            label: statusOption.label,
                            onRemove: () => toggleStatus(statusKey),
                        })
                    }
                })

                values.columns.forEach((columnKey) => {
                    const columnOption = columns.find((option) => option.key === columnKey)

                    if (columnOption) {
                        filters.push({
                            id: `column-${columnKey}`,
                            label: columnOption.label,
                            onRemove: () => toggleColumn(columnKey),
                        })
                    }
                })

                return filters
            },
        }),
        {
            name: 'product-filter-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
