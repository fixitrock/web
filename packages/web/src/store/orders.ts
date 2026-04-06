import { create } from 'zustand'

import type { Order } from '../types/orders'

export interface OrderStoreState {
    selectedOrder: Order | null
    isDetailsOpen: boolean
    isReturnOpen: boolean
    setSelectedOrder: (order: Order | null) => void
    openDetails: (order: Order) => void
    closeDetails: () => void
    openReturn: (order: Order) => void
    closeReturn: () => void
}

export const useOrderStore = create<OrderStoreState>((set) => ({
    selectedOrder: null,
    isDetailsOpen: false,
    isReturnOpen: false,
    setSelectedOrder: (order) => set({ selectedOrder: order }),
    openDetails: (order) => set({ selectedOrder: order, isDetailsOpen: true }),
    closeDetails: () => set({ isDetailsOpen: false, selectedOrder: null }),
    openReturn: (order) => set({ selectedOrder: order, isReturnOpen: true }),
    closeReturn: () => set({ isReturnOpen: false, selectedOrder: null }),
}))
