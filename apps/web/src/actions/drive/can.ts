'use server'

import { revalidatePath } from 'next/cache'

import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { createClient } from '@/supabase/server'

async function userSession() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    if (!data) {
        throw new Error('Not authenticated')
    }

    try {
        const id = data.claims?.sub
        const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single()

        if (error || !user) {
            throw new Error('User not found')
        }

        return user
    } catch {
        throw new Error('Authentication failed')
    }
}

async function checkAdminRole() {
    const user = await userSession()

    if (user.role !== 3) {
        throw new Error('Access denied: Admin role required')
    }

    return user
}

type ActionState = {
    success?: boolean
    message?: string
    errors?: Record<string, string>
    item?: Record<string, unknown>
}

export async function canRename(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await checkAdminRole()

        const itemId = formData.get('itemId') as string
        const newNameRaw = formData.get('newName') as string
        const extension = (formData.get('extension') as string) || ''
        const currentPath = (formData.get('currentPath') as string) || '/'

        if (!itemId?.trim()) {
            return { errors: { itemId: 'Item ID is required' } }
        }

        if (!newNameRaw?.trim()) {
            return { errors: { newName: 'New name is required' } }
        }

        // always preserve extension if present
        const trimmedName = newNameRaw.trim() + extension

        const invalidChars = /[<>:"/\\|?*]/

        if (invalidChars.test(trimmedName)) {
            return {
                errors: { newName: 'File name contains invalid characters: < > : " / \\ | ? *' },
            }
        }

        const client = await Space()

        if (!client) {
            return { errors: { general: 'Failed to initialize OneDrive client' } }
        }

        const response = await client.api(`/me/drive/items/${itemId}`).patch({
            name: trimmedName,
        })

        if (!response) {
            return { errors: { general: 'Failed to rename item - no response from OneDrive' } }
        }

        revalidatePath(currentPath, 'page')
        revalidatePath('/', 'layout')

        logWarning(`✅ Successfully renamed item ${itemId} to "${trimmedName}"`)

        return {
            success: true,
            message: `Successfully renamed to "${trimmedName}"`,
            item: response,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        if (
            errorMessage.includes('Not authenticated') ||
            errorMessage.includes('Authentication failed')
        ) {
            return { errors: { general: 'Please log in to continue' } }
        } else if (errorMessage.includes('Access denied: Admin role required')) {
            return { errors: { general: 'Access denied: Only administrators can rename items' } }
        }

        if (errorMessage.includes('nameAlreadyExists')) {
            return { errors: { newName: `A file or folder with this name already exists` } }
        } else if (errorMessage.includes('invalidRequest')) {
            return { errors: { newName: 'Invalid file name or request format' } }
        } else if (errorMessage.includes('accessDenied')) {
            return {
                errors: { general: 'Access denied - insufficient permissions to rename this item' },
            }
        } else if (errorMessage.includes('itemNotFound')) {
            return { errors: { general: 'Item not found - it may have been moved or deleted' } }
        }

        logWarning(`❌ Failed to rename item:`, errorMessage)

        return { errors: { general: `Failed to rename item: ${errorMessage}` } }
    }
}

export async function canDelete(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        await checkAdminRole()

        const itemId = formData.get('itemId') as string
        const itemName = formData.get('itemName') as string
        const currentPath = (formData.get('currentPath') as string) || '/'

        if (!itemId?.trim()) {
            return { errors: { itemId: 'Item ID is required' } }
        }

        if (!itemName?.trim()) {
            return { errors: { itemName: 'Item name is required for confirmation' } }
        }

        const client = await Space()

        if (!client) {
            return { errors: { general: 'Failed to initialize OneDrive client' } }
        }

        await client.api(`/me/drive/items/${itemId}`).delete()

        revalidatePath(currentPath, 'page')
        revalidatePath('/', 'layout')

        logWarning(`✅ Successfully deleted item "${itemName}" (${itemId})`)

        return {
            success: true,
            message: `Successfully deleted "${itemName}"`,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        if (
            errorMessage.includes('Not authenticated') ||
            errorMessage.includes('Authentication failed')
        ) {
            return { errors: { general: 'Please log in to continue' } }
        } else if (errorMessage.includes('Access denied: Admin role required')) {
            return { errors: { general: 'Access denied: Only administrators can delete items' } }
        }

        if (errorMessage.includes('accessDenied')) {
            return {
                errors: { general: 'Access denied - insufficient permissions to delete this item' },
            }
        } else if (errorMessage.includes('itemNotFound')) {
            return { errors: { general: 'Item not found - it may have already been deleted' } }
        } else if (errorMessage.includes('invalidRequest')) {
            return { errors: { general: 'Invalid delete request' } }
        }

        logWarning(`❌ Failed to delete item:`, errorMessage)

        return { errors: { general: `Failed to delete item: ${errorMessage}` } }
    }
}
