'use server'

import { createClient } from '@/supabase/server'

export async function logout() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    return { success: true }
}
