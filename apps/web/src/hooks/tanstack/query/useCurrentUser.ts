'use client'

import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/supabase/client'
import { User } from '@/app/login/types'

export function useCurrentUser() {
    const query = useQuery<User | null>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return null

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) return null

            return data as User
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    return { ...query }
}
