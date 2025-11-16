'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useTabs() {
    const searchParams = useSearchParams()

    const selectedTab = useMemo(() => {
        return searchParams?.get('tab') || 'activity'
    }, [searchParams])

    return { selectedTab }
}
