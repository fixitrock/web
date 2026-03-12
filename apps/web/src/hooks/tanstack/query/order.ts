'use client'
import { useQuery } from '@tanstack/react-query'

import { userTransactions } from '@/actions/user/order'
import { queryKeys } from './queryKeys'

export function useTransactions(userPhone: number) {
    const query = useQuery({
        queryKey: queryKeys.customerTransactions.list(userPhone),
        queryFn: () => userTransactions(userPhone),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
        enabled: !!userPhone,
    })

    return { ...query }
}
