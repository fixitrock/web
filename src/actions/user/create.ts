'use server'

import type { User } from '@/app/login/types'

import { createClient } from '@/supabase/server'

export async function createUser(profile: Partial<User>): Promise<{ user?: User; error?: string }> {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Not authenticated' }
    }

    const { id, phone } = user

    const { data, error } = await supabase
        .from('users')
        .insert({
            id,
            phone,
            ...profile,
        })
        .select()
        .single()

    if (error) return { error: error.message }

    return { user: data }
}
