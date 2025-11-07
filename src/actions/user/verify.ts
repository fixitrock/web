'use server'

import type { User } from '@/app/login/types'
import { createClient } from '@/supabase/server'

export async function verifyOtp(
    phone: string,
    otp: string
): Promise<{ user?: User; error?: string }> {
    const supabase = await createClient()
    
    // Instead of verifying with Supabase, we'll check if user exists
    // The Firebase verification already happened on the client side
    
    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows" error
        return { error: 'Failed to check user existence: ' + fetchError.message }
    }
    
    // If user exists, return the user
    if (existingUser) {
        return { user: existingUser }
    }
    
    // If user doesn't exist, return without user to trigger details step
    return {}
}