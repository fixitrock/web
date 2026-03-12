'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CreateTransactionType, Order, ReturnData } from '@/types/orders'
import { createOrder, CreateTransaction } from '@/actions/user/order'
import { processReturn } from '@/actions/user/orders'
import { toast } from 'sonner'
import { queryKeys } from '../query/queryKeys'

type QueryKeyGroup = ReadonlyArray<readonly unknown[]>

function invalidateQueryGroups(
    queryClient: ReturnType<typeof useQueryClient>,
    queryKeyGroups: QueryKeyGroup
) {
    return Promise.all(queryKeyGroups.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

export function useOrder() {
    const queryClient = useQueryClient()

    const addOrder = useMutation({
        mutationFn: async (order: Order) => {
            const result = await createOrder({ order })

            return result
        },
        onSuccess: () => {
            return invalidateQueryGroups(queryClient, [
                queryKeys.sellerProducts.all,
                queryKeys.storefrontProducts.all,
                queryKeys.sellerOrders.all,
                queryKeys.customerTransactions.all,
                queryKeys.sellerRecentOrders.all,
                queryKeys.buyerOrders.all,
                queryKeys.transactionHistorySearch.all,
                queryKeys.transactionHistoryByUser.all,
                queryKeys.sellerTopStats.all,
            ])
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
            return invalidateQueryGroups(queryClient, [
                queryKeys.customerTransactions.all,
                queryKeys.sellerOrders.all,
                queryKeys.sellerRecentOrders.all,
                queryKeys.transactionHistorySearch.all,
                queryKeys.transactionHistoryByUser.all,
            ])
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
            return invalidateQueryGroups(queryClient, [
                queryKeys.sellerProducts.all,
                queryKeys.storefrontProducts.all,
                queryKeys.sellerOrders.all,
                queryKeys.buyerOrders.all,
                queryKeys.customerTransactions.all,
                queryKeys.sellerRecentOrders.all,
                queryKeys.transactionHistorySearch.all,
                queryKeys.transactionHistoryByUser.all,
                queryKeys.sellerTopStats.all,
            ])
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to process return')
        },
    })
}
