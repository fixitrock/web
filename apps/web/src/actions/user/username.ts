'use server'

import { createClient } from '@/supabase/server'

export async function checkUsername(username: string): Promise<{ available: boolean }> {
    const supabase = await createClient()
    const { data } = await supabase.from('users').select('id').eq('username', username).single()

    return { available: !data }
}
