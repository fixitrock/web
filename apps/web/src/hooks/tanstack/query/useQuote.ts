'use client'

import { useQuery } from '@tanstack/react-query'

import { getData } from '@/actions/supabase/getData'
import { Quote } from '@/types/user'

export function useQuote() {
    const query = useQuery<Quote[], Error>({
        queryKey: ['Quotes'],
        queryFn: async () => {
            const data = await getData<Quote>('quotes')

            return data.reverse()
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
