'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/supabase/server'
import { logWarning } from '@/lib/utils'

export interface SpaceCredentials {
    id?: number
    client_id: string
    client_secret: string
    refresh_token?: string
    created_at?: string
    updated_at?: string
}

export interface SpaceTokens {
    id?: number
    credential_id: number
    access_token: string
    token_expires_at: string
    created_at?: string
}

export interface OneDriveStatus {
    credentials: boolean
    refreshToken: boolean
    accessToken: boolean
    nextRefresh: string | null
    accessTokenExpiry: string | null
}

// Get OneDrive credentials
export async function getSpaceCredentials(): Promise<SpaceCredentials | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('space_credentials')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No records found
                return null
            }
            throw error
        }

        return data
    } catch (error) {
        logWarning('Error fetching credentials:', error)
        throw new Error('Failed to fetch credentials')
    }
}

// Save or update OneDrive credentials
export async function saveSpaceCredentials(
    credentials: SpaceCredentials
): Promise<SpaceCredentials> {
    try {
        const supabase = await createClient()

        // Validate required fields
        if (!credentials.client_id || !credentials.client_secret) {
            throw new Error('Client ID and Client Secret are required')
        }

        let result

        if (credentials.id) {
            // Update existing record
            const { data, error } = await supabase
                .from('space_credentials')
                .update({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    refresh_token: credentials.refresh_token,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', credentials.id)
                .select()
                .single()

            if (error) throw error
            result = data
        } else {
            // Insert new record
            const { data, error } = await supabase
                .from('space_credentials')
                .insert({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    refresh_token: credentials.refresh_token,
                })
                .select()
                .single()

            if (error) throw error
            result = data
        }

        revalidatePath('/[user]/[slug]', 'page')

        return result
    } catch (error) {
        logWarning('Error saving credentials:', error)
        throw new Error('Failed to save credentials')
    }
}

// Get current access token
export async function getCurrentAccessToken(): Promise<SpaceTokens | null> {
    try {
        logWarning('🔄 Attempting to get current access token from database...')

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('space_tokens')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                logWarning('⚠️ No tokens found in database')

                return null
            }
            logWarning('❌ Error fetching access token:', error)
            throw error
        }

        if (data) {
            logWarning('✅ Retrieved token from database:')
            logWarning('   ID:', data.id)
            logWarning('   Credential ID:', data.credential_id)
            logWarning('   Token length:', data.access_token?.length || 'undefined')
            logWarning(
                '   Token preview:',
                data.access_token?.substring(0, 20) + '...' || 'undefined'
            )
            logWarning('   Expires at:', data.token_expires_at)
            logWarning('   Created at:', data.created_at)
        } else {
            logWarning('⚠️ No token data returned from database')
        }

        return data
    } catch (error) {
        logWarning('❌ Error fetching access token:', error)

        return null
    }
}

// Save new access token
export async function saveAccessToken(
    credentialId: number,
    accessToken: string,
    expiresIn: number
): Promise<SpaceTokens> {
    try {
        logWarning('🔄 Attempting to save access token for credential ID:', credentialId)
        logWarning('📝 Access token length:', accessToken.length)
        logWarning('📝 Access token preview:', accessToken.substring(0, 20) + '...')
        logWarning('⏰ Expires in seconds:', expiresIn)

        const supabase = await createClient()

        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        logWarning('📅 Token expires at:', tokenExpiresAt)

        const { data, error } = await supabase
            .from('space_tokens')
            .insert({
                credential_id: credentialId,
                access_token: accessToken,
                token_expires_at: tokenExpiresAt,
            })
            .select()
            .single()

        if (error) {
            logWarning('❌ Supabase error saving access token:', error)
            throw error
        }

        logWarning('✅ Access token saved successfully with ID:', data.id)
        logWarning('📝 Saved token length:', data.access_token?.length || 'undefined')
        logWarning(
            '📝 Saved token preview:',
            data.access_token?.substring(0, 20) + '...' || 'undefined'
        )

        // Remove revalidatePath call that causes render errors
        // revalidatePath('/[user]/[slug]', 'page')

        return data
    } catch (error) {
        logWarning('❌ Error saving access token:', error)

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('permission denied')) {
                throw new Error('Permission denied: Check RLS policies on space_tokens table')
            } else if (
                error.message.includes('relation') &&
                error.message.includes('does not exist')
            ) {
                throw new Error(
                    'space_tokens table does not exist. Please run the database migration.'
                )
            } else if (error.message.includes('foreign key')) {
                throw new Error(
                    'Invalid credential_id: The space_credentials record does not exist'
                )
            }
        }

        throw new Error(
            `Failed to save access token: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

// Update refresh token
export async function updateRefreshToken(
    credentialId: number,
    refreshToken: string
): Promise<void> {
    try {
        logWarning('🔄 Updating refresh token for credential ID:', credentialId)
        const supabase = await createClient()

        // First verify the credential exists
        const { data: existing, error: fetchError } = await supabase
            .from('space_credentials')
            .select('id')
            .eq('id', credentialId)
            .single()

        if (fetchError || !existing) {
            logWarning('❌ Credential not found with ID:', credentialId)
            throw new Error(`Credential with ID ${credentialId} not found. Please set up your OneDrive credentials first.`)
        }

        const updateData: {
            refresh_token: string
            updated_at: string
        } = {
            refresh_token: refreshToken,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
            .from('space_credentials')
            .update(updateData)
            .eq('id', credentialId)

        if (error) {
            logWarning('❌ Supabase error updating refresh token:', error)
            throw error
        }

        logWarning('✅ Refresh token updated successfully')
        revalidatePath('/[user]/[slug]', 'page')
    } catch (error) {
        logWarning('❌ Error updating refresh token:', error)
        
        if (error instanceof Error) {
            throw error
        }
        
        throw new Error('Failed to update refresh token')
    }
}

// Get OneDrive integration status
export async function getOneDriveStatus(): Promise<OneDriveStatus> {
    try {
        const credentials = await getSpaceCredentials()
        const accessToken = await getCurrentAccessToken()

        const now = new Date()
        const status: OneDriveStatus = {
            credentials: !!(credentials?.client_id && credentials?.client_secret),
            refreshToken: !!credentials?.refresh_token,
            accessToken: !!(accessToken && new Date(accessToken.token_expires_at) > now),
            nextRefresh: null,
            accessTokenExpiry: accessToken?.token_expires_at || null,
        }

        // Calculate next refresh time (refresh 5 minutes before expiry)
        if (accessToken) {
            const expiryTime = new Date(accessToken.token_expires_at)
            const refreshTime = new Date(expiryTime.getTime() - 5 * 60 * 1000) // 5 minutes before

            status.nextRefresh = refreshTime.toISOString()
        }

        return status
    } catch (error) {
        logWarning('Error getting OneDrive status:', error)

        return {
            credentials: false,
            refreshToken: false,
            accessToken: false,
            nextRefresh: null,
            accessTokenExpiry: null,
        }
    }
}
