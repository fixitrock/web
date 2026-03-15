'use client'
import { productSlug, sellerProducts, userCategories, userProducts } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export function useSellerProducts(search: string, category: string) {
    const query = useQuery({
        queryKey: queryKeys.sellerProducts.list(search, category),
        queryFn: () => sellerProducts(search, category),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
export function useProductSlug(slug: string) {
    const query = useQuery({
        queryKey: queryKeys.productSlug.list(slug),
        queryFn: () => productSlug(slug),
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
        queryKey: queryKeys.storefrontProducts.list(username, search, category, page, limit),
        queryFn: () => userProducts(username, search, category, page, limit),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}

export function useUserCategories(username: string) {
    const query = useQuery({
        queryKey: queryKeys.storefrontProductCategories.list(username),
        queryFn: () => userCategories(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
