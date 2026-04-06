'use client'

import { useMemo } from 'react'
import { create } from 'zustand'

import type { Product, ProductVariant } from '../types/product'

export type PriceType = 'retail' | 'wholesale'

export interface PosTypeStoreState {
    type: PriceType
    setType: (type: PriceType) => void
    toggleType: () => void
}

export const usePosTypeStore = create<PosTypeStoreState>((set, get) => ({
    type: 'retail',
    setType: (type) => set({ type }),
    toggleType: () => set({ type: get().type === 'retail' ? 'wholesale' : 'retail' }),
}))

export interface PosSelectionState {
    allBrands: string[]
    colors: string[]
    storages: string[]
    selected: {
        brand: string | null
        color: string | null
        storage: string | null
    }
    setSelected: {
        brand: (brand: string | null) => void
        color: (color: string | null) => void
        storage: (storage: string | null) => void
    }
    active: ProductVariant | null
}

const createPosStore = (product: Product) =>
    create<PosSelectionState>((set, get) => {
        const variants = product.variants || []
        const brandGroups = new Map<string, ProductVariant[]>()

        variants.forEach((variant) => {
            const key = variant.brand?.trim() || 'default'
            if (!brandGroups.has(key)) {
                brandGroups.set(key, [])
            }
            brandGroups.get(key)!.push(variant)
        })

        const allBrands = Array.from(brandGroups.keys()).filter((brand) => brand !== 'default')
        const unique = <T>(values: T[]) => Array.from(new Set(values.filter(Boolean)))

        const getColorsForBrand = (brand: string | null) => {
            if (!brand) return []

            const matchingVariants = brandGroups.get(brand) || []
            return unique(
                matchingVariants
                    .map((variant) => variant.color?.name)
                    .filter((name): name is string => name !== undefined)
            )
        }

        const getStorages = (brand: string | null, color: string | null) => {
            if (!brand) return []

            let matchingVariants = brandGroups.get(brand) || []
            if (color) {
                matchingVariants = matchingVariants.filter((variant) => variant.color?.name === color)
            }

            return unique(matchingVariants.map((variant) => variant.storage))
        }

        const hasBrands = allBrands.length > 0
        const hasColors = variants.some((variant) => variant.color?.name)
        const hasStorages = variants.some((variant) => variant.storage)

        const initialBrand = hasBrands ? (allBrands[0] ?? null) : (variants[0]?.brand ?? null)
        const initialColors = hasColors ? getColorsForBrand(initialBrand) : []
        const initialColor = initialColors[0] ?? null
        const initialStorages = hasStorages ? getStorages(initialBrand, initialColor) : []
        const initialStorage = null

        const findActive = (selected: PosSelectionState['selected']) =>
            variants.find(
                (variant) =>
                    (!selected.brand || variant.brand === selected.brand) &&
                    (!selected.color || variant.color?.name === selected.color) &&
                    (!selected.storage || variant.storage === selected.storage)
            ) ||
            variants.find((variant) => variant.brand === selected.brand) ||
            variants[0] ||
            null

        const selected = { brand: initialBrand, color: initialColor, storage: initialStorage }
        const active = findActive(selected)

        return {
            allBrands: hasBrands ? allBrands : [],
            colors: hasColors ? initialColors : [],
            storages: hasStorages ? initialStorages : [],
            selected,
            active,
            setSelected: {
                brand: (brand) => {
                    const colors = hasColors ? getColorsForBrand(brand) : []
                    const color = colors[0] ?? null
                    const storages = hasStorages ? getStorages(brand, color) : []
                    const storage = storages[0] ?? null
                    const nextSelection = { brand, color, storage }

                    set({
                        selected: nextSelection,
                        colors,
                        storages,
                        active: findActive(nextSelection),
                    })
                },
                color: (color) => {
                    const brand = get().selected.brand
                    const storages = hasStorages ? getStorages(brand, color) : []
                    const storage = storages[0] ?? null
                    const nextSelection = { ...get().selected, color, storage }

                    set({
                        selected: nextSelection,
                        storages,
                        active: findActive(nextSelection),
                    })
                },
                storage: (storage) => {
                    const nextSelection = { ...get().selected, storage }
                    set({ selected: nextSelection, active: findActive(nextSelection) })
                },
            },
        }
    })

export const usePosStore = (product: Product) => {
    const store = useMemo(() => createPosStore(product), [product])
    return store()
}
