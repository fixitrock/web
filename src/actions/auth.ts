'use server'

import { createClient } from '@/supabase/server'

export type PermissionAction = 'create' | 'update' | 'delete' | 'view'
export type CanType = Record<string, Record<string, boolean>>

export async function checkAuth(username: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('can', { p_username: username })

    if (error) {
        console.error('Permission check failed:', error)
        throw new Error('Failed to check permissions')
    }

    const can: CanType = {}

    for (const item of data || []) {
        const [action, resource] = item.permission_key.split(':') as [PermissionAction, string]
        if (!can[action]) can[action] = {}
        can[action][resource] = item.has_permission
    }

    return { can }
}
