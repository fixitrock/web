'use server'

import { createClient } from '@/supabase/server'

export type PermissionAction = 'create' | 'update' | 'delete'

export type CanType = {
    [K in PermissionAction]?: boolean
}

export async function checkAuth(permissions: string[]) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('checkauth', {
        p_permissions: permissions,
    })

    if (error) {
        console.error('Permission check failed:', error)
        throw new Error('Failed to check permissions')
    }

    const can: CanType = {}

    for (const item of data || []) {
        const [action] = item.permission_key.split(':') as [PermissionAction, string]
        can[action] = item.has_permission
    }

    return { can }
}
