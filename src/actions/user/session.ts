'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { Navigation, User } from '@/app/login/types'
import { Navigations } from '@/components/search/type'

const getSession = cache(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('session')

    if (error || !data) return { user: null, navigation: [], command: null }

    const user = data.user as User
    let navigation = data.navigation as Navigation[]
    let command = data.command as Record<string, Navigations> | null

    navigation = navigation.map((item) => ({
        ...item,
        href: `/@${user.username}/${item.href?.replace(/^\/+/, '') ?? ''}`,
    }))

    if (command) {
        command = Object.fromEntries(
            Object.entries(command).map(([groupName, items]) => [
                groupName,
                items.map((item) => ({
                    ...item,
                    href: item.href
                        ? `/@${user.username}/${item.href.replace(/^\/+/, '')}`
                        : `/@${user.username}/`,
                })),
            ])
        )
    }

    return { user, navigation, command }
})

export async function userSession(): Promise<{
    user: User | null
    navigation: Navigation[]
    command: Record<string, Navigations> | null
}> {
    return getSession()
}
