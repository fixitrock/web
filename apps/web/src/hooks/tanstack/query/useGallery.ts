'use client'

import { useQuery } from '@tanstack/react-query'

import { getGallery } from '@/actions/users/gallery'

export function useGallery(username: string) {
    const query = useQuery({
        queryKey: ['Gallery', username],
        queryFn: () => getGallery(username),
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
