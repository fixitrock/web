'use client'
import { useQuery } from '@tanstack/react-query'
import { sellerOrders } from '@/actions/user'

export function useSellerOrders(search: string) {
    const query = useQuery({
        queryKey: ['sellerOrders', search],
        queryFn: () => sellerOrders(search),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,

    })

    return { ...query }
}
