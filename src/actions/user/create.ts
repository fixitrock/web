'use server'

import type { User } from '@/app/login/types'
import { createClient } from '@/supabase/server'

export async function createUser(profile: Partial<User>): Promise<{ user?: User; error?: string }> {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Not authenticated' }
    }

    const { id, phone } = user

    if (!phone) {
        return { error: 'Phone not found in auth user' }
    }

    const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .limit(1)

    if (fetchError) {
        return { error: fetchError.message }
    }

    const existingUser = existingUsers?.[0]

    if (existingUser) {
        if (!existingUser.auth_id) {
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    auth_id: id,
                    ...profile,
                })
                .eq('id', existingUser.id)
                .select()
                .single()

            if (updateError) {
                return { error: updateError.message }
            }
            return { user: updatedUser }
        }
        return { user: existingUser }
    }

    const { data, error } = await supabase
        .from('users')
        .insert({
            auth_id: id,
            phone,
            ...profile,
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }
    return { user: data }
}
