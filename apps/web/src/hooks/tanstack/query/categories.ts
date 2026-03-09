'use client'

import { getCategories } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'

export function useCategories() {
    return useQuery({
        queryKey: ['Categories'],
        queryFn: () => getCategories(),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    })
}
