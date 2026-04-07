'use client'

import { useQuery } from '@tanstack/react-query'

import { getProfile } from '@/actions/users/profile'

export function useProfile(username: string) {
    const query = useQuery({
        queryKey: ['Profile', username],
        queryFn: () => getProfile(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
