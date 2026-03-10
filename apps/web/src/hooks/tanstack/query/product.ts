'use client'
import { sellerProducts, userCategories, userProducts } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'

export function useSellerProducts(search: string, category: string) {
    const query = useQuery({
        queryKey: ['SellerProducts', search, category],
        queryFn: () => sellerProducts(search, category),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
export function useUserProducts(
    username: string,
    search: string,
    category: string,
    page?: number,
    limit?: number
) {
    const query = useQuery({
        queryKey: ['UserProducts', username, search, category],
        queryFn: () => userProducts(username, search, category, page, limit),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useUserCategories(username: string) {
    const query = useQuery({
        queryKey: ['UserCategories', username],
        queryFn: () => userCategories(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
