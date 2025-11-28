'use client'
import { useQuery } from '@tanstack/react-query'
import { sellerOrders, sellerRecentOrders, sellerTop } from '@/actions/user'

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

export function useRecentOrders(username: string) {
    const query = useQuery({
        queryKey: ['RecentOrders', username],
        queryFn: () => sellerRecentOrders(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,

    })

    return { ...query }
}

export function useTop(username: string) {
    const query = useQuery({
        queryKey: ['top', username],
        queryFn: () => sellerTop(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,

    })

    return { ...query }
}

