// store/product.ts
import { create } from 'zustand'
import type { Product, ProductVariant } from '@/types/product'

export type ProductMode = 'add' | 'update'

interface ProductState {
    mode: ProductMode
    form: Partial<Product>
    editingProduct: Product | null
    errors: Record<string, string>
    setMode: (mode: ProductMode, product?: Product | null) => void
    setForm: (form: Partial<Product>) => void
    resetForm: () => void
    addVariant: (variant: ProductVariant) => void
    duplicateVariant: (index: number) => void
    updateVariant: (index: number, variant: Partial<ProductVariant>) => void
    removeVariant: (index: number) => void
    validate: () => boolean
}

export const useProductStore = create<ProductState>((set, get) => ({
    mode: 'add',
    editingProduct: null,
    errors: {},
    form: {
        id: '',
        name: '',
        description: '',
        compatibility: '',
        category: '',
        variants: [
            {
                brand: '',
                storage: '',
                purchase_price: 0,
                wholesale_price: 0,
                price: 0,
                mrp: 0,
                quantity: 0,
                image: [],
                color: null,
            },
        ],
    },

    setMode: (mode, product = null) => {
        if (mode === 'update' && product) {
            set({
                mode,
                editingProduct: product,
                form: {
                    ...product,
                    variants: product.variants ?? [],
                },
                errors: {},
            })
        } else {
            set({
                mode,
                editingProduct: null,
                form: {
                    id: '',
                    name: '',
                    description: '',
                    compatibility: '',
                    category: '',
                    variants: [
                        {
                            brand: '',
                            storage: '',
                            purchase_price: 0,
                            wholesale_price: 0,
                            price: 0,
                            mrp: 0,
                            quantity: 0,
                            image: [],
                            color: null,
                        },
                    ],
                },
                errors: {},
            })
        }
    },

    setForm: (form) =>
        set((state) => {
            const newForm = { ...state.form, ...form }
            const newErrors = { ...state.errors }
            Object.keys(form).forEach((key) => {
                if (newErrors[key]) delete newErrors[key]
            })

            return { form: newForm, errors: newErrors }
        }),

    resetForm: () =>
        set({
            form: {
                id: '',
                name: '',
                description: '',
                compatibility: '',
                category: '',
                variants: [
                    {
                        brand: '',
                        storage: '',
                        purchase_price: 0,
                        wholesale_price: 0,
                        price: 0,
                        mrp: 0,
                        quantity: 0,
                        image: [],
                        color: null,
                    },
                ],
            },
            editingProduct: null,
            mode: 'add',
            errors: {},
        }),

    addVariant: (variant) =>
        set({
            form: {
                ...get().form,
                variants: [...(get().form.variants ?? []), variant],
            },
        }),

    duplicateVariant: (index) =>
        set((state) => {
            const variants = [...(state.form.variants ?? [])]
            const item = variants[index]
            if (!item) return { form: { ...state.form } }

            // shallow clone the variant, clone image array if present
            const cloned = {
                ...item,
                image: item.image ? [...item.image] : [],
            }

            variants.splice(index + 1, 0, cloned)

            return { form: { ...state.form, variants } }
        }),

    updateVariant: (index, variant) =>
        set((state) => {
            const variants = [...(state.form.variants ?? [])]
            const updated = { ...variants[index], ...variant }
            variants[index] = updated

            const newErrors = { ...state.errors }

            Object.keys(variant).forEach((key) => {
                const errKey = `variant-${index}-${key}`
                if (newErrors[errKey]) delete newErrors[errKey]
            })

            return { form: { ...state.form, variants }, errors: newErrors }
        }),

    removeVariant: (index) =>
        set({
            form: {
                ...get().form,
                variants: get().form.variants?.filter((_, i) => i !== index),
            },
        }),

    validate: () => {
        const { form } = get()
        const errors: Record<string, string> = {}

        if (!form.name?.trim()) errors.name = 'Product name is required.'
        if (!form.category?.trim()) errors.category = 'Category is required.'

        form.variants?.forEach((v, i) => {
            if (!v.brand?.trim()) errors[`variant-${i}-brand`] = 'Brand is required.'
            if (v.quantity === undefined || v.quantity <= 0)
                errors[`variant-${i}-quantity`] = 'Quantity must be greater than 0.'
            // if (v.price === undefined || v.price <= 0)
            //     errors[`variant-${i}-price`] = 'Price must be greater than 0.'
        })

        set({ errors })
        return Object.keys(errors).length === 0
    },
}))
