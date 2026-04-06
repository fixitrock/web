import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type FilterValues = {
    categories: string[]
    brands: string[]
    status: string[]
    columns: string[]
}

export type ActiveFilter = {
    id: string
    label: string
    onRemove: () => void
}

export interface ProductFilterStoreState {
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

export const useProductFilterStore = create<ProductFilterStoreState>()(
    persist(
        (set, get) => ({
            values: initial,
            toggleCategory: (category) =>
                set((state) => ({
                    values: {
                        ...state.values,
                        categories: state.values.categories.includes(category)
                            ? state.values.categories.filter((value) => value !== category)
                            : [...state.values.categories, category],
                    },
                })),
            toggleBrand: (brand) =>
                set((state) => ({
                    values: {
                        ...state.values,
                        brands: state.values.brands.includes(brand)
                            ? state.values.brands.filter((value) => value !== brand)
                            : [...state.values.brands, brand],
                    },
                })),
            toggleStatus: (status) =>
                set((state) => ({
                    values: {
                        ...state.values,
                        status: state.values.status.includes(status)
                            ? state.values.status.filter((value) => value !== status)
                            : [...state.values.status, status],
                    },
                })),
            toggleColumn: (column) =>
                set((state) => ({
                    values: {
                        ...state.values,
                        columns: state.values.columns.includes(column)
                            ? state.values.columns.filter((value) => value !== column)
                            : [...state.values.columns, column],
                    },
                })),
            reset: () => set({ values: initial }),
            clearCategory: () => set((state) => ({ values: { ...state.values, categories: [] } })),
            clearBrand: () => set((state) => ({ values: { ...state.values, brands: [] } })),
            clearStatus: () => set((state) => ({ values: { ...state.values, status: [] } })),
            getActiveFilters: (statusOptions, columnOptions) => {
                const { values, toggleCategory, toggleBrand, toggleStatus, toggleColumn } = get()
                const filters: ActiveFilter[] = []

                values.categories.forEach((category) => {
                    filters.push({
                        id: `category-${category}`,
                        label: category,
                        onRemove: () => toggleCategory(category),
                    })
                })

                values.brands.forEach((brand) => {
                    filters.push({
                        id: `brand-${brand}`,
                        label: brand,
                        onRemove: () => toggleBrand(brand),
                    })
                })

                values.status.forEach((statusKey) => {
                    const statusOption = statusOptions.find((option) => option.key === statusKey)

                    if (statusOption) {
                        filters.push({
                            id: `status-${statusKey}`,
                            label: statusOption.label,
                            onRemove: () => toggleStatus(statusKey),
                        })
                    }
                })

                values.columns.forEach((columnKey) => {
                    const columnOption = columnOptions.find((option) => option.key === columnKey)

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
