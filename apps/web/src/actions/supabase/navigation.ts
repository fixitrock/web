'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'

export type NavigationItem = {
    href: string
    icon: string
    title: string
}

export const getNavigation = cache(async (id: number): Promise<NavigationItem[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('roles').select('navigation').eq('id', id).single()

    if (error) {
        throw new Error(error.message)
    }

    // If navigation is null, return empty array
    return (data?.navigation as NavigationItem[]) || []
})
