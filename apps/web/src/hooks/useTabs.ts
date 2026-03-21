'use client'

import { useSearchParams } from 'next/navigation'

export function useTabs() {
    const searchParams = useSearchParams()

    const selectedTab = searchParams.get('tab') || 'activity'
    const category = searchParams.get('category')
    const search = searchParams.get('search') || ''

    return { selectedTab, category, search }
}
