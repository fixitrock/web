'use client'

import { getSearch } from '@/actions/drive'
import { useQuery } from '@tanstack/react-query'

export function useSearch(query: string) {
    return useQuery({
        queryKey: ['Space', query],
        queryFn: () => getSearch(query),
        enabled: query.trim().length >= 2,
        retry: false,
    })
}
