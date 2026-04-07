'use client'

import { useQuery } from '@tanstack/react-query'

import { getData } from '@/actions/supabase/getData'

export function useSupabse<T>(
    table: string,
    filters?: [string, string, string | number | boolean]
) {
    const query = useQuery<T[]>({
        queryKey: [table, filters],
        queryFn: async () => getData<T>(table, filters),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
