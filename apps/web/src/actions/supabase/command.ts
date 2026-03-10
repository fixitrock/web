'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { Navigations } from '@/components/search/type'

export const getCommand = cache(async (id: number): Promise<Record<string, Navigations>> => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('roles').select('command').eq('id', id).single()

    if (error) {
        throw new Error(error.message)
    }

    return data?.command || null
})
