'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateTransactionType, Order, ReturnData } from '@/types/orders'
import { createOrder, CreateTransaction } from '@/actions/user/order'
import { processReturn } from '@/actions/user/orders'
import { toast } from 'sonner'

export function useOrder() {
    const queryClient = useQueryClient()

    const addOrder = useMutation({
        mutationFn: async (order: Order) => {
            const result = await createOrder({ order })

            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SellerProducts'] })
            queryClient.invalidateQueries({ queryKey: ['sellerOrders'] })
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
            queryClient.invalidateQueries({ queryKey: ['sellerOrders'] })
        },
    })

    return { addTransaction }
}

export function useReturnOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ReturnData) => {
            const result = await processReturn(data)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result
        },
        onSuccess: () => {
            toast.success('Return processed successfully')
            queryClient.invalidateQueries({ queryKey: ['sellerOrders'] })
            queryClient.invalidateQueries({ queryKey: ['userTransactions'] })
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to process return')
        }
    })
}
