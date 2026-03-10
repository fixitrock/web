import { create } from 'zustand'
import { nanoid } from 'nanoid'

interface Variant {
    id: string
    name: string
}

interface VariantState {
    variants: Variant[]
    addVariant: () => void
    removeVariant: (id: string) => void
    resetVariants: () => void
}

export const useVariantsStore = create<VariantState>((set) => ({
    variants: [{ id: nanoid(), name: 'Variant 1' }],

    addVariant: () =>
        set((state) => {
            const nextIndex = state.variants.length + 1
            const newVariant = { id: nanoid(), name: `Variant ${nextIndex}` }
            return { variants: [...state.variants, newVariant] }
        }),

    removeVariant: (id) =>
        set((state) => ({
            variants: state.variants.filter((v) => v.id !== id),
        })),

    resetVariants: () => set({ variants: [{ id: nanoid(), name: 'Variant 1' }] }),
}))
