'use client'

import { create } from 'zustand'
import { useMemo } from 'react'
import { Product, ProductVariant } from '@/types/product'

// --------------------------------------
// POS Type Store (retail / wholesale)
// --------------------------------------
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

// --------------------------------------
// POS Product Store
// --------------------------------------
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
  active: ProductVariant | null
}

const createPosStore = (product: Product) =>
  create<PosState>((set, get) => {
    // Use `variants` safely (fallback to empty array)
    const variants = product.variants || []

    // Map variants by brand for easier filtering
    const brandGroups = new Map<string, ProductVariant[]>()

    variants.forEach((v) => {
      const key = v.brand?.trim() || 'default'
      if (!brandGroups.has(key)) brandGroups.set(key, [])
      brandGroups.get(key)!.push(v)
    })

    const allBrands = Array.from(brandGroups.keys()).filter((b) => b !== 'default')

    // Helper: unique list helper
    const unique = <T,>(arr: T[]) => Array.from(new Set(arr.filter(Boolean)))

    // Get colors for brand
    const getColorsForBrand = (brand: string | null): string[] => {
        if (!brand) return []
        const variants = brandGroups.get(brand) || []
        return unique(
            variants.map((v) => v.color?.name).filter((name): name is string => name !== undefined)
        )
    }

    // Get storages for brand + color
    const getStorages = (brand: string | null, color: string | null): string[] => {
        if (!brand) return []
        const variants = brandGroups.get(brand) || []

        let filtered = variants
        if (color) filtered = filtered.filter((v) => v.color?.name === color)

        return unique(filtered.map((v) => v.storage))
    }

    // Determine available filters
    const hasBrands = allBrands.length > 0
    const hasColors = variants.some((v) => v.color?.name)
    const hasStorages = variants.some((v) => v.storage)

    // Initial selections
    const initialBrand = hasBrands ? allBrands[0] : variants[0]?.brand || null
    const initialColors = hasColors ? getColorsForBrand(initialBrand) : []
    const initialColor = initialColors[0] ?? null
    const initialStorages = hasStorages ? getStorages(initialBrand, initialColor) : []
    const initialStorage = null

    // Find the active variant
    const findActive = (sel: {
      brand: string | null
      color: string | null
      storage: string | null
    }): ProductVariant | null => {
      if (!variants.length) return null

      return (
        variants.find(
          (v) =>
            (!sel.brand || v.brand === sel.brand) &&
            (!sel.color || v.color?.name === sel.color) &&
            (!sel.storage || v.storage === sel.storage)
        ) ||
        variants.find((v) => v.brand === sel.brand) ||
        variants[0] ||
        null
      )
    }

    const selected = { brand: initialBrand, color: initialColor, storage: initialStorage }
    const active = findActive(selected)

    return {
      allBrands: hasBrands ? allBrands : [],
      colors: hasColors ? initialColors : [],
      storages: hasStorages ? initialStorages : [],
      selected,
      active,
      setSelected: {
        brand: (brand: string | null) => {
          const colors = hasColors ? getColorsForBrand(brand) : []
          const color = colors[0] ?? null
          const storages = hasStorages ? getStorages(brand, color) : []
          const storage = storages[0] ?? null

          const sel = { brand, color, storage }
          set({
            selected: sel,
            colors,
            storages,
            active: findActive(sel),
          })
        },
        color: (color: string | null) => {
          const brand = get().selected.brand
          const storages = hasStorages ? getStorages(brand, color) : []
          const storage = storages[0] ?? null

          const sel = { ...get().selected, color, storage }
          set({
            selected: sel,
            storages,
            active: findActive(sel),
          })
        },
        storage: (storage: string | null) => {
          const sel = { ...get().selected, storage }
          set({ selected: sel, active: findActive(sel) })
        },
      },
    }
  })

// --------------------------------------
// Hook for use in components
// --------------------------------------
export const usePosStore = (product: Product) => {
  const store = useMemo(() => createPosStore(product), [product])
  return store()
}
