'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'

export const getBalance = cache(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('balance')

    if (error) {
        return { get: 0, give: 0 }
    }

    return data as { get: number; give: number }
})