'use client'

import type { CustomerInput } from '@/types'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { searchCustomer, sellerCategories, addCustomer } from '@/actions/user/pos'
import { logWarning } from '@/lib/utils'

export function usePosCategories() {
    const query = useQuery({
        queryKey: ['posCategories'],
        queryFn: () => sellerCategories(),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useCustomerSearch(query: string, enabled = !!query && /^\d{10}$/.test(query)) {
    return useQuery({
        queryKey: ['customer', query],
        queryFn: () => searchCustomer(query),
        enabled,
        staleTime: 1000 * 60, // 1 min
        gcTime: 1000 * 60 * 5,
    })
}

export function useAddCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (customer: CustomerInput) => addCustomer(customer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer'] })
        },
        onError: (err) => {
            logWarning('Error adding customer', err)
        },
    })
}
