// store/product.ts
import { create } from 'zustand'
import type { Product, ProductVariant } from '@/types/product'

export type ProductMode = 'add' | 'update'

const EMPTY_VARIANT: ProductVariant = {
    id: '',
    brand: '',
    storage: '',
    purchase_price: 0,
    wholesale_price: 0,
    price: 0,
    mrp: 0,
    quantity: 0,
    image: [],
    color: null,
}

function normalizeVariant(variant: Partial<ProductVariant> | undefined): ProductVariant {
    return {
        id: typeof variant?.id === 'string' ? variant.id : '',
        product_id: variant?.product_id,
        brand: typeof variant?.brand === 'string' ? variant.brand : '',
        image: Array.isArray(variant?.image) ? variant.image : [],
        files: variant?.files,
        color: variant?.color ?? null,
        storage: typeof variant?.storage === 'string' ? variant.storage : '',
        purchase_price: variant?.purchase_price as number,
        wholesale_price: variant?.wholesale_price as number,
        price: variant?.price as number,
        mrp: variant?.mrp as number,
        quantity: variant?.quantity as number,
        created_at: variant?.created_at,
        updated_at: variant?.updated_at,
        deleted_at: variant?.deleted_at ?? null,
    }
}

function normalizeProduct(product: Product): Product {
    return {
        ...product,
        thumbnail: product.thumbnail ?? '',
        variants:
            Array.isArray(product.variants) && product.variants.length > 0
                ? product.variants.map((v) => normalizeVariant(v))
                : [normalizeVariant(EMPTY_VARIANT)],
    }
}

interface ProductState {
    mode: ProductMode
    form: Partial<Product>
    editingProduct: Product | null
    errors: Record<string, string>
    isDirty: boolean
    remoteUpdateAvailable: boolean
    pendingRemoteProduct: Product | null
    setMode: (mode: ProductMode, product?: Product | null) => void
    syncEditingProduct: (product: Product) => void
    scheduleSyncEditingProduct: (product: Product) => void
    reloadFromRemote: () => void
    setForm: (form: Partial<Product>) => void
    resetForm: () => void
    addVariant: (variant: ProductVariant) => void
    duplicateVariant: (index: number) => void
    updateVariant: (index: number, variant: Partial<ProductVariant>) => void
    removeVariant: (index: number) => void
    validate: () => boolean
    isUploading: boolean
    setUploading: (uploading: boolean) => void
}

export const useProductStore = create<ProductState>((set, get) => {
    let syncQueuedProduct: Product | null = null
    let isSyncQueued = false

    return {
        mode: 'add',
        editingProduct: null,
        errors: {},
        isDirty: false,
        remoteUpdateAvailable: false,
        pendingRemoteProduct: null,
        form: {
            id: '',
            name: '',
            description: '',
            compatibility: '',
            category: '',
            thumbnail: '',
            variants: [EMPTY_VARIANT],
        },
        isUploading: false,
        setUploading: (uploading) => set({ isUploading: uploading }),
        setMode: (mode, product = null) => {
            if (mode === 'update' && product) {
                const normalized = normalizeProduct(product)

                set({
                    mode,
                    editingProduct: normalized,
                    form: {
                        ...normalized,
                    },
                    errors: {},
                    isDirty: false,
                    remoteUpdateAvailable: false,
                    pendingRemoteProduct: null,
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
                        thumbnail: '',
                        variants: [EMPTY_VARIANT],
                    },
                    errors: {},
                    isDirty: false,
                    remoteUpdateAvailable: false,
                    pendingRemoteProduct: null,
                })
            }
        },

        syncEditingProduct: (product) => {
            const state = get()
            const normalized = normalizeProduct(product)

            if (!state.editingProduct || state.editingProduct.id !== normalized.id) {
                set({
                    mode: 'update',
                    editingProduct: normalized,
                    form: {
                        ...normalized,
                    },
                    errors: {},
                    isDirty: false,
                    remoteUpdateAvailable: false,
                    pendingRemoteProduct: null,
                })
                return
            }

            const incomingVersion = normalized.updated_at ?? ''
            const currentVersion = state.editingProduct.updated_at ?? ''

            if (!incomingVersion || incomingVersion === currentVersion) {
                return
            }

            if (state.isDirty) {
                set({
                    remoteUpdateAvailable: true,
                    pendingRemoteProduct: normalized,
                })
                return
            }

            set({
                editingProduct: normalized,
                form: {
                    ...normalized,
                },
                errors: {},
                isDirty: false,
                remoteUpdateAvailable: false,
                pendingRemoteProduct: null,
            })
        },

        scheduleSyncEditingProduct: (product) => {
            syncQueuedProduct = product

            if (isSyncQueued) {
                return
            }

            isSyncQueued = true

            queueMicrotask(() => {
                isSyncQueued = false
                if (!syncQueuedProduct) return

                const latestProduct = syncQueuedProduct
                syncQueuedProduct = null

                get().syncEditingProduct(latestProduct)
            })
        },

        reloadFromRemote: () =>
            set((state) => {
                if (!state.pendingRemoteProduct) return {}

                const product = normalizeProduct(state.pendingRemoteProduct)

                return {
                    editingProduct: product,
                    form: {
                        ...product,
                    },
                    errors: {},
                    isDirty: false,
                    remoteUpdateAvailable: false,
                    pendingRemoteProduct: null,
                }
            }),

        setForm: (form) =>
            set((state) => {
                const newForm = { ...state.form, ...form }
                const newErrors = { ...state.errors }
                Object.keys(form).forEach((key) => {
                    if (newErrors[key]) delete newErrors[key]
                })

                return { form: newForm, errors: newErrors, isDirty: true }
            }),

        resetForm: () =>
            set({
                form: {
                    id: '',
                    name: '',
                    description: '',
                    compatibility: '',
                    category: '',
                    thumbnail: '',
                    variants: [EMPTY_VARIANT],
                },
                editingProduct: null,
                mode: 'add',
                errors: {},
                isDirty: false,
                remoteUpdateAvailable: false,
                pendingRemoteProduct: null,
            }),

        addVariant: (variant) =>
            set({
                form: {
                    ...get().form,
                    variants: [...(get().form.variants ?? []), variant],
                },
                isDirty: true,
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

                return { form: { ...state.form, variants }, isDirty: true }
            }),

        updateVariant: (index, variant) =>
            set((state) => {
                const variants = [...(state.form.variants ?? [])]
                const currentVariant = variants[index]

                if (!currentVariant) {
                    return { form: { ...state.form }, errors: state.errors }
                }

                const updated: ProductVariant = { ...currentVariant, ...variant }
                variants[index] = updated

                const newErrors = { ...state.errors }

                Object.keys(variant).forEach((key) => {
                    const errKey = `variant-${index}-${key}`
                    if (newErrors[errKey]) delete newErrors[errKey]
                })

                return { form: { ...state.form, variants }, errors: newErrors, isDirty: true }
            }),

        removeVariant: (index) =>
            set({
                form: {
                    ...get().form,
                    variants: get().form.variants?.filter((_, i) => i !== index),
                },
                isDirty: true,
            }),

        validate: () => {
            const { form, mode } = get()
            const errors: Record<string, string> = {}

            if (!form.name?.trim()) errors.name = 'Product name is required.'
            if (!form.category?.trim()) errors.category = 'Category is required.'

            form.variants?.forEach((v, i) => {
                if (!v.brand?.trim()) errors[`variant-${i}-brand`] = 'Brand is required.'

                const isInvalidQuantity =
                    mode === 'add'
                        ? v.quantity === undefined || v.quantity <= 0
                        : v.quantity === undefined || v.quantity < 0

                if (isInvalidQuantity)
                    errors[`variant-${i}-quantity`] =
                        mode === 'add'
                            ? 'Quantity must be greater than 0.'
                            : 'Quantity cannot be negative.'
                // if (v.price === undefined || v.price <= 0)
                //     errors[`variant-${i}-price`] = 'Price must be greater than 0.'
            })

            set({ errors })
            return Object.keys(errors).length === 0
        },
    }
})
