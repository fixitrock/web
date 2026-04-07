import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { myOrders, sellerOrders, sellerRecentOrders, sellerTop } from '@/actions/user'
import { queryKeys } from './queryKeys'

export function useSellerOrders(search: string) {
    const query = useQuery({
        queryKey: queryKeys.sellerOrders.list(search),
        queryFn: () => sellerOrders(search),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useMyOrders(search: string) {
    const query = useInfiniteQuery({
        queryKey: queryKeys.buyerOrders.list(search),
        queryFn: ({ pageParam = 1 }) => myOrders(search, pageParam as number),
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useRecentOrders(username: string) {
    const query = useQuery({
        queryKey: queryKeys.sellerRecentOrders.list(username),
        queryFn: () => sellerRecentOrders(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useTop(username: string) {
    const query = useQuery({
        queryKey: queryKeys.sellerTopStats.list(username),
        queryFn: () => sellerTop(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
