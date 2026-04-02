import { NextResponse } from 'next/server'

import { createLoginSession } from '@/actions/user/login'
import { exchangeFirebaseIdToken } from '@/lib/auth/firebase-exchange'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const idToken = typeof body?.idToken === 'string' ? body.idToken : ''

        if (!idToken) {
            return NextResponse.json({ error: 'Missing Firebase ID token.' }, { status: 400 })
        }

        const result = await exchangeFirebaseIdToken(idToken)

        if (result.error || !result.session) {
            return NextResponse.json(
                { error: result.error || 'Could not create Supabase session.' },
                { status: 400 }
            )
        }

        const userAgent = request.headers.get('user-agent') || 'Unknown'
        const sessionUserId = result.user?.id ?? result.session.user.id

        await createLoginSession(
            sessionUserId,
            result.session.access_token,
            userAgent,
            'firebase_otp',
            'success'
        )

        return NextResponse.json({
            accessToken: result.session.access_token,
            refreshToken: result.session.refresh_token,
            user: result.user ?? null,
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Mobile Firebase auth failed.' },
            { status: 500 }
        )
    }
}
