'use server'

import { revalidatePath } from 'next/cache'

import { siteConfig } from '@/config/site'
import { logWarning, withErrorHandling } from '@/lib/utils'

import { getSpaceCredentials, updateRefreshToken, saveAccessToken } from './credentials'

// Generate Microsoft OAuth URL for getting refresh token
export const generateMicrosoftAuthUrl = withErrorHandling(
    async (returnUrl?: string): Promise<string> => {
        const credentials = await getSpaceCredentials()

        if (!credentials?.client_id) {
            throw new Error('Please save your Client ID and Client Secret first')
        }

        // Build Microsoft OAuth authorization URL
        const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')

        authUrl.searchParams.set('client_id', credentials.client_id)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('redirect_uri', siteConfig.redirectUri)
        authUrl.searchParams.set(
            'scope',
            'offline_access Files.ReadWrite.All Sites.ReadWrite.All User.Read'
        )
        authUrl.searchParams.set('response_mode', 'query')
        authUrl.searchParams.set('prompt', 'consent')

        // Add return URL as state parameter for better redirect handling
        if (returnUrl) {
            authUrl.searchParams.set('state', encodeURIComponent(returnUrl))
        }

        return authUrl.toString()
    }
)

// Handle OAuth callback and get refresh token
export const handleOAuthCallback = withErrorHandling(
    async (code: string): Promise<{ success: boolean; message: string }> => {
        logWarning('🔐 Starting OAuth callback handling...')
        const credentials = await getSpaceCredentials()

        if (!credentials) {
            throw new Error(
                'No API credentials found. Please set up your Client ID and Client Secret first.'
            )
        }

        if (!credentials.id) {
            throw new Error('Credential record has no ID. Please recreate your credentials.')
        }

        logWarning('✅ Found credentials with ID:', credentials.id)

        // Exchange authorization code for tokens
        logWarning('🔄 Exchanging authorization code for tokens...')
        const tokenResponse = await fetch(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: siteConfig.redirectUri,
                }),
            }
        )

        if (!tokenResponse.ok) {
            const errorDetails = await tokenResponse.text()
            let errorMessage = 'Token exchange failed'

            // Check for specific Microsoft errors
            if (errorDetails.includes('AADSTS50011')) {
                errorMessage = `Redirect URI mismatch! Please add this exact URI in Azure Portal: ${siteConfig.redirectUri}`
            } else if (errorDetails.includes('AADSTS54005')) {
                errorMessage =
                    'This authorization code has already been used. Please generate a new refresh token from the dashboard.'
            } else if (errorDetails.includes('invalid_grant')) {
                errorMessage =
                    'Authorization code is invalid or expired. Please generate a new refresh token.'
            } else {
                errorMessage = `Token exchange failed: ${errorDetails}`
            }

            logWarning('❌ Token exchange failed:', errorMessage)
            throw new Error(errorMessage)
        }

        const tokenData = await tokenResponse.json()
        const { refresh_token, access_token, expires_in } = tokenData

        if (!refresh_token) {
            throw new Error('No refresh token received from Microsoft')
        }

        logWarning('✅ Received tokens from Microsoft')
        logWarning('   Refresh token length:', refresh_token.length)
        logWarning('   Access token length:', access_token?.length || 0)

        // Update credentials with new refresh token
        logWarning('🔄 Updating refresh token in database...')
        await updateRefreshToken(credentials.id, refresh_token)

        // Save initial access token
        if (access_token && expires_in) {
            logWarning('🔄 Saving access token in database...')
            await saveAccessToken(credentials.id, access_token, expires_in)
        }

        revalidatePath('/[user]/[slug]', 'page')

        logWarning('🎉 OAuth callback completed successfully!')
        return {
            success: true,
            message: 'Successfully obtained refresh token and access token!',
        }
    }
)

// Refresh access token using refresh token
export const refreshAccessToken = withErrorHandling(
    async (): Promise<{ success: boolean; message: string }> => {
        const credentials = await getSpaceCredentials()

        if (!credentials?.refresh_token) {
            throw new Error('No refresh token available')
        }

        logWarning('🔄 Refreshing access token for credential ID:', credentials.id)

        // Exchange refresh token for new access token
        const tokenResponse = await fetch(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    refresh_token: credentials.refresh_token,
                    grant_type: 'refresh_token',
                }),
            }
        )

        if (!tokenResponse.ok) {
            const errorDetails = await tokenResponse.text()

            if (errorDetails.includes('AADSTS700082')) {
                throw new Error(
                    'Refresh token has expired due to inactivity. Please generate a new one.'
                )
            }

            throw new Error(`Token refresh failed: ${errorDetails}`)
        }

        const {
            access_token,
            expires_in,
            refresh_token: new_refresh_token,
        } = await tokenResponse.json()

        if (!access_token) {
            throw new Error('No access token received')
        }

        logWarning('✅ Received new access token from Microsoft, storing in database...')

        // Store new access token in Supabase
        try {
            await saveAccessToken(credentials.id!, access_token, expires_in)
            logWarning('✅ Access token stored successfully in Supabase')
        } catch (saveError) {
            logWarning('❌ Failed to store access token in Supabase:', saveError)
            throw new Error(
                `Failed to store access token: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`
            )
        }

        // Update refresh token if a new one was provided
        if (new_refresh_token && new_refresh_token !== credentials.refresh_token) {
            try {
                await updateRefreshToken(credentials.id!, new_refresh_token)
                logWarning('✅ Refresh token updated successfully')
            } catch (updateError) {
                logWarning('⚠️ Failed to update refresh token, but continuing:', updateError)
                // Don't fail the whole operation if refresh token update fails
            }
        }

        // Test the access token to ensure it works
        try {
            const testResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!testResponse.ok) {
                logWarning('⚠️ Access token test failed, but continuing...')
            } else {
                logWarning('✅ Access token successfully tested with Microsoft Graph API')
            }
        } catch (testError) {
            logWarning('⚠️ Could not test access token:', testError)
            // Continue anyway - the token might still be valid
        }

        revalidatePath('/[user]/[slug]', 'page')
        revalidatePath('/', 'page')

        logWarning('🎉 Access token refresh and storage completed successfully!')

        return {
            success: true,
            message: 'Access token refreshed and stored successfully!',
        }
    }
)

// Test OneDrive connection with current access token
export const testOneDriveConnection = withErrorHandling(
    async (): Promise<{ success: boolean; message: string }> => {
        const { createClient } = await import('@/supabase/server')
        const supabase = await createClient()

        // Get current access token
        const { data: tokenData, error: tokenError } = await supabase
            .from('space_tokens')
            .select('access_token')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (tokenError || !tokenData?.access_token) {
            throw new Error('No valid access token found')
        }

        // Test the connection with Microsoft Graph API
        const testResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!testResponse.ok) {
            const errorDetails = await testResponse.text()

            throw new Error(`Connection test failed: ${errorDetails}`)
        }

        return {
            success: true,
            message: 'OneDrive connection test successful!',
        }
    }
)
