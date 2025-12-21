'use server'

import { unstable_cache } from 'next/cache'
import { createStaticClient } from '@/supabase/server'

export async function userProfile(username: string) {
    return unstable_cache(
        async () => {
            const supabase = await createStaticClient()
            const { data, error } = await supabase.rpc('user_profile', { username })

            if (error || !data || !data.user) return null

            return {
                user: data.user,
                navigation: data.navigation || [],
                command: data.command || null,
                tabs: data.tabs || [],
            }
        },
        [`user:${username}`],
        {
            tags: [`user:${username}`],
            revalidate: 3600,
        }
    )()
}
