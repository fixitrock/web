'use server'

import { cache } from 'react'
import { createClient } from '@/supabase/server'

export type PermissionAction = 'create' | 'update' | 'delete' | 'return' | 'view'
export type CanType = Record<PermissionAction, Record<string, boolean>>

export const checkAuth = cache(async (username: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('can', { p_username: username })

    if (error) throw new Error('Failed to check permissions')

    const can: CanType = {
        create: {},
        update: {},
        delete: {},
        return: {},
        view: {},
    }

    for (const item of data || []) {
        const [action, resource] = item.permission_key.split(':') as [PermissionAction, string]
        can[action][resource] = item.has_permission
    }

    return { can }
})
