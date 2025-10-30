'use client'
import { sellerProducts } from "@/actions/user"
import { useQuery } from "@tanstack/react-query"

export function useSellerProducts(search: string, category: string ) {
    const query = useQuery({
        queryKey: ['SellerProducts', search, category],
        queryFn: () => sellerProducts(search, category),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
} 