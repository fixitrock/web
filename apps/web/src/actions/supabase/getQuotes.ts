'use server'

import { cache } from 'react'

import { Quotes } from '@/app/login/types'
import { createClient } from '@/supabase/server'

export const getQuotes = cache(async (username: string): Promise<Quotes[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('username', username)
        .order('lastModifiedDateTime', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data as Quotes[]
})
