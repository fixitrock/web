'use client'

import { create } from 'zustand'

import { ProductVariant } from '@/types/product'
import { CustomerInput } from '@/types'
import { Order } from '@/types/orders'

export type Customer = CustomerInput
export type PaymentMethodType = 'cash' | 'upi' | 'card' | 'paylater'

type CartItem = {
    id: string
    product: { id: string; name: string; category: string }
    variant: ProductVariant
    quantity: number
    price: number
    selectedOptions: {
        brand: string | null
        color: string | null
        storage: string | null
    }
    serialNumbers: string[]
}

type TransactionState = {
    amount: number
    note: string
    mode: PaymentMethodType
}

type PosState = {
    transactions: {
        debit: TransactionState
        credit: TransactionState
    }
    setTransactionAmount: (type: 'debit' | 'credit', value: number) => void
    setTransactionNote: (type: 'debit' | 'credit', note: string) => void
    setTransactionMode: (type: 'debit' | 'credit', mode: PaymentMethodType) => void
    clearTransaction: (type?: 'debit' | 'credit') => void

    selectedCustomer: Customer | null
    setSelectedCustomer: (customer: Customer | null) => void
    clearCustomer: () => void

    paidAmount: number
    setPaidAmount: (amount: number) => void

    note: Record<PaymentMethodType, string> // <--- updated to track per payment method
    setNote: (method: PaymentMethodType, value: string) => void

    selectedPaymentMethod: PaymentMethodType | ''
    setSelectedPaymentMethod: (method: PaymentMethodType | '') => void

    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id' | 'serialNumbers'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    updatePrice: (id: string, price: number) => void
    clearCart: () => void

    addSerialNumber: (id: string, serial: string) => void
    updateSerialNumber: (id: string, index: number, value: string) => void
    removeSerialNumber: (id: string, index: number) => void
    setSerialNumbers: (id: string, serials: string[]) => void

    getTotalItems: () => number
    getTotalPrice: () => number
    canAddItem: (
        product: { id: string; name: string; product_variants: ProductVariant[] },
        selectedOptions: CartItem['selectedOptions'],
        qtyToAdd?: number
    ) => boolean

    clearAll: () => void
    order: () => Order | null
}

export const useCartStore = create<PosState>((set, get) => ({
    transactions: {
        debit: { amount: 0, note: '', mode: 'cash' },
        credit: { amount: 0, note: '', mode: 'cash' },
    },

    setTransactionAmount: (type, value) =>
        set((state) => ({
            transactions: {
                ...state.transactions,
                [type]: { ...state.transactions[type], amount: value },
            },
        })),

    setTransactionNote: (type, note) =>
        set((state) => ({
            transactions: {
                ...state.transactions,
                [type]: { ...state.transactions[type], note },
            },
        })),

    setTransactionMode: (type, mode) =>
        set((state) => ({
            transactions: {
                ...state.transactions,
                [type]: { ...state.transactions[type], mode },
            },
        })),

    clearTransaction: (type) =>
        set((state) => ({
            transactions: type
                ? { ...state.transactions, [type]: { amount: 0, note: '', mode: 'cash' } }
                : {
                      debit: { amount: 0, note: '', mode: 'cash' },
                      credit: { amount: 0, note: '', mode: 'cash' },
                  },
        })),
    selectedCustomer: null,
    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
    clearCustomer: () => set({ selectedCustomer: null }),

    paidAmount: 0,
    setPaidAmount: (amount) => set({ paidAmount: amount }),

    note: { cash: '', upi: '', card: '', paylater: '' }, // <-- init notes per method
    setNote: (method, value) => set((state) => ({ note: { ...state.note, [method]: value } })),

    selectedPaymentMethod: '',
    setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

    items: [],
    addItem: (newItem) =>
        set((state) => {
            const existingIndex = state.items.findIndex(
                (item) => item.variant.id === newItem.variant.id
            )

            if (existingIndex >= 0) {
                const existingItem = state.items[existingIndex]

                if (existingItem.quantity < existingItem.variant.quantity) {
                    const updatedItems = [...state.items]

                    updatedItems[existingIndex] = {
                        ...existingItem,
                        quantity: existingItem.quantity + 1,
                    }

                    return { items: updatedItems }
                }

                return { items: state.items }
            }

            if (newItem.quantity <= newItem.variant.quantity) {
                const cartItem: CartItem = {
                    id: newItem.variant.id,
                    product: {
                        id: newItem.product.id,
                        name: newItem.product.name,
                        category: newItem.product.category,
                    },
                    variant: newItem.variant,
                    quantity: newItem.quantity,
                    price: newItem.price,
                    selectedOptions: newItem.selectedOptions,
                    serialNumbers: [],
                }

                return { items: [...state.items, cartItem] }
            }

            return { items: state.items }
        }),

    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    updateQuantity: (id, quantity) =>
        set((state) => ({
            items: state.items
                .map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
                )
                .filter((i) => i.quantity > 0),
        })),
    updatePrice: (id, price) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, price: Math.max(0, price) } : item
            ),
        })),
    clearCart: () => set({ items: [] }),

    addSerialNumber: (id, serial) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, serialNumbers: [...item.serialNumbers, serial] } : item
            ),
        })),
    updateSerialNumber: (id, index, value) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          serialNumbers: item.serialNumbers.map((s, i) =>
                              i === index ? value : s
                          ),
                      }
                    : item
            ),
        })),
    removeSerialNumber: (id, index) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id
                    ? { ...item, serialNumbers: item.serialNumbers.filter((_, i) => i !== index) }
                    : item
            ),
        })),
    setSerialNumbers: (id, serials) =>
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, serialNumbers: serials } : item
            ),
        })),

    getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),

    canAddItem: (product, selectedOptions, qtyToAdd = 1) => {
        const { items } = get()
        const variant = product.product_variants.find(
            (v) =>
                v.brand === selectedOptions.brand &&
                v.color.name === selectedOptions.color &&
                v.storage === selectedOptions.storage
        )

        if (!variant) return false
        const existingItem = items.find((i) => i.variant.id === variant.id)

        return existingItem
            ? existingItem.quantity + qtyToAdd <= variant.quantity
            : qtyToAdd <= variant.quantity
    },

    clearAll: () =>
        set({
            items: [],
            selectedCustomer: null,
            paidAmount: 0,
            note: { cash: '', upi: '', card: '', paylater: '' }, // reset notes per method
            selectedPaymentMethod: '',
        }),

    order: () => {
        const state = get()

        if (!state.selectedCustomer || !state.selectedPaymentMethod) return null

        return {
            userName: state.selectedCustomer.name || '',
            userPhone: state.selectedCustomer.phone || '',
            userAddress: state.selectedCustomer.address || {},
            totalAmount: state.getTotalPrice(),
            paid: state.selectedPaymentMethod === 'paylater' ? 0 : state.paidAmount,
            mode: state.selectedPaymentMethod,
            note: state.note[state.selectedPaymentMethod as PaymentMethodType] || null,
            products: state.items.map((item) => ({
                productID: item.variant.id,
                name: item.product.name,
                category: item.product.category,
                brand: item.selectedOptions.brand || item.variant.brand,
                color: item.selectedOptions.color
                    ? { name: item.selectedOptions.color, code: item.variant.color.code }
                    : item.variant.color,
                storage: item.selectedOptions.storage || item.variant.storage,
                serial: item.serialNumbers,
                price: item.price,
                purchasePrice: item.variant.purchase_price,
                quantity: item.quantity,
                returnedQuantity: 0,
                total: item.price * item.quantity,
                createdAt: item.variant.created_at,
                updatedAt: item.variant.updated_at,
            })),
        } as Order
    },
}))
