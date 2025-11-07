'use server'

import { createClient } from '@/supabase/server'

export async function sendOtp(phone: string): Promise<{ error?: string }> {
    // This function is kept for compatibility but Firebase handles OTP sending
    // We'll just return success to avoid errors
    return {}
}