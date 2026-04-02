'use server'

import { headers } from 'next/headers'

import { createLoginSession } from '@/actions/user/login'
import { exchangeFirebaseIdToken } from '@/lib/auth/firebase-exchange'

export async function verifyFirebaseLogin(
    idToken: string
): Promise<{ user?: any; error?: string }> {
    try {
        const result = await exchangeFirebaseIdToken(idToken)
        if (result.error || !result.session) {
            return { error: result.error || 'Login failed.' }
        }

        const supabaseSSR = await import('@/supabase/server').then((m) => m.createClient())
        await supabaseSSR.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
        })

        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'

        const sessionUserId = result.user?.id ?? result.session.user.id
        await createLoginSession(
            sessionUserId,
            result.session.access_token,
            userAgent,
            'firebase_otp',
            'success'
        )

        return { user: result.user || undefined }
    } catch (error: any) {
        console.error('Verify Action Error:', error)
        return { error: error.message || 'Verification failed.' }
    }
}
