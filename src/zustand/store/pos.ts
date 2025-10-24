'use client'

import { create } from 'zustand'
import { useMemo } from 'react'

import { Product, ProductVariant } from '@/types/product'

type PriceType = 'retail' | 'wholesale'

type PosGlobalState = {
    type: PriceType
    setType: (t: PriceType) => void
    toggleType: () => void
}

export const usePosTypeStore = create<PosGlobalState>((set, get) => ({
    type: 'retail',
    setType: (t) => set({ type: t }),
    toggleType: () => set({ type: get().type === 'retail' ? 'wholesale' : 'retail' }),
}))

type PosState = {
    allBrands: string[]
    colors: string[]
    storages: string[]
    selected: {
        brand: string | null
        color: string | null
        storage: string | null
    }
    setSelected: {
        brand: (b: string | null) => void
        color: (c: string | null) => void
        storage: (s: string | null) => void
    }
    active: ProductVariant
}

const createPosStore = (product: Product) =>
    create<PosState>((set, get) => {
        const variants: ProductVariant[] = product.product_variants || []

        const brandGroups = new Map<string, ProductVariant[]>()

        variants.forEach((v) => {
            const key = v.brand

            if (!brandGroups.has(key)) brandGroups.set(key, [])
            brandGroups.get(key)!.push(v)
        })

        const allBrands = Array.from(brandGroups.keys())
        const activeBrand = allBrands[0] ?? null

        // Get colors for a specific brand
        const getColorsForBrand = (brand: string | null) => {
            if (!brand) return []
            const brandVariants = brandGroups.get(brand) || []

            return Array.from(new Set(brandVariants.map((v) => v.color.name)))
        }

        // Get storages for a specific brand and color
        const getStoragesForBrandAndColor = (brand: string | null, color: string | null) => {
            if (!brand) return []
            const brandVariants = brandGroups.get(brand) || []

            if (!color) {
                // If no color selected, show all storages for this brand
                return Array.from(new Set(brandVariants.map((v) => v.storage)))
            }
            // Filter by both brand and color
            const filteredVariants = brandVariants.filter((v) => v.color.name === color)

            return Array.from(new Set(filteredVariants.map((v) => v.storage)))
        }

        // Get storages for current selection
        const getStoragesForCurrentSelection = (brand: string | null, color: string | null) => {
            return getStoragesForBrandAndColor(brand, color)
        }

        // Initial selection
        const initialBrand = activeBrand
        const initialColors = initialBrand ? getColorsForBrand(initialBrand) : []
        const initialColor = initialColors.length > 0 ? initialColors[0] : null
        const initialStorages = initialBrand
            ? getStoragesForCurrentSelection(initialBrand, initialColor)
            : []
        const initialStorage = initialStorages.length > 0 ? initialStorages[0] : null

        const selected = {
            brand: initialBrand,
            color: initialColor,
            storage: initialStorage,
        }

        const findActive = (sel: {
            brand: string | null
            color: string | null
            storage: string | null
        }) => {
            if (!sel.brand) {
                return variants[0] || null
            }

            const brandVariants = brandGroups.get(sel.brand) || []

            // First try to match all criteria
            if (sel.color && sel.storage) {
                const exactMatch = brandVariants.find(
                    (v) => v.color.name === sel.color && v.storage === sel.storage
                )

                if (exactMatch) return exactMatch
            }

            // Then try to match color
            if (sel.color) {
                const colorMatch = brandVariants.find((v) => v.color.name === sel.color)

                if (colorMatch) return colorMatch
            }

            // Then try to match storage
            if (sel.storage) {
                const storageMatch = brandVariants.find((v) => v.storage === sel.storage)

                if (storageMatch) return storageMatch
            }

            // Return first variant for the brand
            return brandVariants[0] || variants[0] || null
        }

        const activeVariant = findActive(selected)

        return {
            allBrands,
            colors: initialColors,
            storages: initialStorages,
            selected,
            active: activeVariant,
            setSelected: {
                brand: (brand: string | null) => {
                    const colors = brand ? getColorsForBrand(brand) : []
                    const color = colors.length > 0 ? colors[0] : null
                    const storages = brand ? getStoragesForCurrentSelection(brand, color) : []
                    const storage = storages.length > 0 ? storages[0] : null

                    const newSelected = {
                        brand,
                        color,
                        storage,
                    }

                    set({
                        selected: newSelected,
                        colors,
                        storages,
                        active: findActive(newSelected),
                    })
                },
                color: (color: string | null) => {
                    const currentBrand = get().selected.brand
                    const storages = currentBrand
                        ? getStoragesForCurrentSelection(currentBrand, color)
                        : []
                    const storage = storages.length > 0 ? storages[0] : null

                    const newSelected = {
                        ...get().selected,
                        color,
                        storage,
                    }

                    set({
                        selected: newSelected,
                        storages,
                        active: findActive(newSelected),
                    })
                },
                storage: (storage: string | null) => {
                    const newSelected = { ...get().selected, storage }

                    set({
                        selected: newSelected,
                        active: findActive(newSelected),
                    })
                },
            },
        }
    })

export const usePosStore = (product: Product) => {
    const store = useMemo(() => createPosStore(product), [product])

    return store()
}
