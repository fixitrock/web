'use server'

import { createClient } from '@/supabase/server'

export async function sendOtp(phone: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({ phone })

    if (error) return { error: error.message }

    return {}
}