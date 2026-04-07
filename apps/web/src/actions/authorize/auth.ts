'use server'

import { createClient } from '@/supabase/server'

import { PermissionKey } from './can'

export async function authorize(permission: PermissionKey) {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) throw new Error('Not authenticated')

    const { data: permissionsData, error: permError } = await supabase.rpc('get_user_permissions', {
        user_id: user.id,
    })

    if (permError || !permissionsData || !Array.isArray(permissionsData)) {
        throw new Error('Failed to fetch permissions')
    }

    const hasPermission = permissionsData.some(
        (p: { permission_key: string }) => p.permission_key === permission
    )

    return hasPermission
}
