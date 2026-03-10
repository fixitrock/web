'use client'

import { getBrands } from '@/actions/user/brand'
import { useQuery } from '@tanstack/react-query'

export function useBrands() {
    return useQuery({
        queryKey: ['Brands'],
        queryFn: () => getBrands(),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    })
}
