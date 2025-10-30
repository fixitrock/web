'use server'

import { cache } from 'react'

import { TabsConfig } from '@/app/login/types'
import { createClient } from '@/supabase/server'

export const getTabs = cache(async (id: number): Promise<TabsConfig[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('roles').select('tabs').eq('id', id).single()

    if (error) {
        throw new Error(error.message)
    }

    return (data?.tabs as TabsConfig[]) || []
})
