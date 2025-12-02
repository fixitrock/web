'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { User } from '@/app/login/types'

export const getUser = cache(async (username: string): Promise<User | null> => {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("user", {username})

    if (error || !data) return null

    return data as User
})
