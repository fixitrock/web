'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateTransactionType, Order } from '@/types/orders'
import { createOrder, CreateTransaction } from '@/actions/user/order'

export function useOrder() {
    const queryClient = useQueryClient()

    const addOrder = useMutation({
        mutationFn: async (order: Order) => {
            const result = await createOrder({ order })

            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SellerProducts'] })
            queryClient.invalidateQueries({ queryKey: ['userTransactions'] })
        },
    })

    return { addOrder }
}

export function useTransactions() {
    const queryClient = useQueryClient()

    const addTransaction = useMutation({
        mutationFn: async (transaction: CreateTransactionType) => {
            const result = await CreateTransaction(transaction)

            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userTransactions'] })
        },
    })

    return { addTransaction }
}
