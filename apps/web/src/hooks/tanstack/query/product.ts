'use client'
import { productSlug, sellerProducts, userCategories, userProducts } from '@/actions/user'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
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
        enabled: !!slug,
    })

    return { ...query }
}

export function useUserProducts(
    username: string,
    search: string,
    category: string,
    page: number = 1,
    limit?: number
) {
    const initialPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1

    const query = useInfiniteQuery({
        queryKey: queryKeys.storefrontProducts.list(username, search, category, undefined, limit),
        queryFn: async ({ pageParam = initialPage }) => {
            const requestedPage =
                Number.isFinite(pageParam as number) && Number(pageParam) > 0
                    ? Math.floor(Number(pageParam))
                    : initialPage

            if (requestedPage === initialPage && initialPage > 1) {
                const pages = await Promise.all(
                    Array.from({ length: initialPage }, (_, index) =>
                        userProducts(username, search, category, index + 1, limit)
                    )
                )
                const last = pages[pages.length - 1]

                return {
                    ...last,
                    products: pages.flatMap((page) => page.products ?? []),
                    page: initialPage,
                }
            }

            return userProducts(username, search, category, requestedPage, limit)
        },
        initialPageParam: initialPage,
        enabled: Boolean(username),
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        select: (data) => {
            const pages = data.pages
            const firstPage = pages[0]
            const lastPage = pages.at(-1)
            const products = pages.flatMap((page) => page.products ?? [])

            return {
                pages,
                products,
                total: firstPage?.total ?? 0,
                error: lastPage?.error ?? firstPage?.error ?? null,
                empty: products.length === 0,
                page: lastPage?.page ?? initialPage,
                limit: lastPage?.limit ?? limit ?? 42,
                total_pages: lastPage?.total_pages ?? 1,
                hasMore: lastPage?.hasMore ?? false,
            }
        },
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
