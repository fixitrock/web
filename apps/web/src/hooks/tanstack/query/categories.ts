'use client'

import { getCategories } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.productCategories.all,
        queryFn: () => getCategories(),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    })
}
