'use client'

import { getBrands } from '@/actions/user/brand'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export function useBrands() {
    return useQuery({
        queryKey: queryKeys.brands.all,
        queryFn: () => getBrands(),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    })
}
