'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { SlugConfig } from '@/app/login/types'

export const getSlug = cache(async (id: number): Promise<SlugConfig[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('roles').select('slug').eq('id', id).single()

    if (error) {
        throw new Error(error.message)
    }

    // If slug is null, return empty array
    return (data?.slug as SlugConfig[]) || []
})
