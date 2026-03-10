'use client'

import { useQuery } from '@tanstack/react-query'

import { getID } from '@/actions/drive'

export function useID(id: string) {
    const query = useQuery({
        queryKey: ['ID', id],
        queryFn: () => getID(id),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
