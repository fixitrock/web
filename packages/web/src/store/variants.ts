import { nanoid } from 'nanoid'
import { create } from 'zustand'

export interface VariantItem {
    id: string
    name: string
}

export interface VariantsStoreState {
    variants: VariantItem[]
    addVariant: () => void
    removeVariant: (id: string) => void
    resetVariants: () => void
}

export const useVariantsStore = create<VariantsStoreState>((set) => ({
    variants: [{ id: nanoid(), name: 'Variant 1' }],
    addVariant: () =>
        set((state) => {
            const nextIndex = state.variants.length + 1
            const newVariant = { id: nanoid(), name: `Variant ${nextIndex}` }

            return { variants: [...state.variants, newVariant] }
        }),
    removeVariant: (id) =>
        set((state) => ({
            variants: state.variants.filter((variant) => variant.id !== id),
        })),
    resetVariants: () => set({ variants: [{ id: nanoid(), name: 'Variant 1' }] }),
}))
