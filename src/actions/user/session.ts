'use server'

import { cache } from 'react'


import { Navigation, User } from '@/app/login/types'
import { createClient } from '@/supabase/server'
import { Navigations } from '@/components/search/type'

export const userSession = cache(async function userSession(): Promise<{
    user: User | null
    navigation: Navigation[]
    command: Record<string, Navigations> | null
}> {
    const supabase = await createClient()
    const { data, error: claimsError } = await supabase.auth.getClaims()
    const claims = data?.claims

    if (claimsError || !claims?.sub) return { user: null, navigation: [], command: null }

    const id = claims.sub

    const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single()

    if (error || !user) {
        return { user: null, navigation: [], command: null }
    }

    let navFromDb: Navigation[] = []
    let commandFromDb: Record<string, Navigations> | null = null

    if (user.role) {
        const { data: roleData } = await supabase
            .from('roles')
            .select('navigation, command')
            .eq('id', user.role)
            .single()

        if (roleData) {
            navFromDb = (roleData.navigation as Navigation[]) || []
            commandFromDb = (roleData.command as Record<string, Navigations>) || null
        }
    }

    const navigation: Navigation[] = [
        {
            href: `/@${user.username}`,
            icon: 'Activity',
            title: 'Activity',
            description: 'Go to your profile',
        },
        ...navFromDb.map((item) => ({
            ...item,
            href: `/@${user.username}/${item.href.replace(/^\/+/, '')}`,
        })),
    ]

    const processedCommand = commandFromDb
        ? Object.fromEntries(
            Object.entries(commandFromDb).map(([groupName, items]) => [
                groupName,
                Array.isArray(items)
                    ? items.map((item) => ({
                        ...item,
                        href: item.href
                            ? `/@${user.username}/${item.href.replace(/^\/+/, '')}`
                            : `/@${user.username}/`,
                    }))
                    : [],
            ])
        )
        : null

    return { user: user as User, navigation, command: processedCommand }
})
