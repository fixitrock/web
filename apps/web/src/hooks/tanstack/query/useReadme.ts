import { useQuery } from '@tanstack/react-query'

import { getReadme } from '@/actions/drive'

export function useReadme(slug: string) {
    return useQuery({
        queryKey: ['readme', slug],
        queryFn: () => getReadme(slug),
        enabled: !!slug,
        refetchOnWindowFocus: false,
    })
}
