'use client'

import { useSearchParams } from 'next/navigation'

export function useTabs() {
    const searchParams = useSearchParams()

    const selectedTab = searchParams.get('tab') || 'activity'
    const category = searchParams.get('cat') || null
    const search = searchParams.get('q') || ''

    return { selectedTab, category, search }
}
