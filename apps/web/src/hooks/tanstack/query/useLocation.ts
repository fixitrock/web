'use client'

import { useQuery } from '@tanstack/react-query'

import { getLocation } from '@/actions/users'

export function useLocation(id: string) {
    const query = useQuery({
        queryKey: ['Location', id],
        queryFn: () => getLocation(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
