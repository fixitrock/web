'use server'

import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

import { adminAuth } from '@/firebase/admin'
import { createLoginSession } from '@/actions/user/login'
import { User } from '@/app/login/types'

export async function verifyFirebaseLogin(
    idToken: string
): Promise<{ user?: User; error?: string }> {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            return { error: 'Server configuration error.' }
        }

        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // 1. Verify Firebase Token
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const phone = decodedToken.phone_number

        if (!phone) return { error: 'No phone number found in Firebase token.' }

        let userId: string | undefined

        // 2. Fast Lookup: Check public.users directly (O(1))
        // Handles "9199..." vs "+9199..." format mismatch
        const phoneClean = phone.replace('+', '') // 919876543210

        const { data: existingProfile } = await supabaseAdmin
            .from('users')
            .select('id')
            .or(`phone.eq.${phone},phone.eq.${phoneClean}`)
            .maybeSingle()

        if (existingProfile) {
            userId = existingProfile.id
        }

        // 3. If not in public records, try Creating Auth User (New User Path)
        if (!userId) {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser(
                {
                    phone: phone,
                    phone_confirm: true,
                }
            )

            if (newUser.user) {
                userId = newUser.user.id
            } else if (
                createError?.code === 'phone_exists' ||
                createError?.message?.includes('registered')
            ) {
                // 4. Zombie Recovery: Auth exists but Profile missing
                // Use listUsers as last resort to find the ID
                const {
                    data: { users },
                } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
                // Loose match
                const targetSimple = phone.replace(/\D/g, '').slice(-10)
                const zombie = users.find((u) =>
                    u.phone?.replace(/\D/g, '')?.includes(targetSimple)
                )

                if (zombie) {
                    userId = zombie.id
                } else {
                    return { error: 'Account stuck in invalid state. Please contact support.' }
                }
            } else {
                return { error: 'Failed to create account.' }
            }
        }

        // 5. Mint Session (Force Password Strategy)
        if (!userId) return { error: 'User identification failed.' }

        const tempPassword = crypto.randomUUID() + '-temp'

        // Set temp password AND confirm phone (since we verified via Firebase)
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: tempPassword,
            phone_confirm: true,
        })
        if (updateError) {
            return { error: 'Login preparation failed.' }
        }

        // Sign In
        const { data: signInData, error: signInError } =
            await supabaseAdmin.auth.signInWithPassword({
                phone: phone, // Try E.164 first
                password: tempPassword,
            })

        if (signInError || !signInData.session) {
            // Retry with clean phone if first attempt failed (edge case)
            const { data: retryData, error: retryError } =
                await supabaseAdmin.auth.signInWithPassword({
                    phone: phoneClean,
                    password: tempPassword,
                })

            if (retryError || !retryData.session) {
                return { error: 'Login failed.' }
            }
            signInData.session = retryData.session
        }

        // 6. Set Cookies
        const supabaseSSR = await import('@/supabase/server').then((m) => m.createClient())
        await supabaseSSR.auth.setSession({
            access_token: signInData.session!.access_token,
            refresh_token: signInData.session!.refresh_token,
        })

        // 7. Log & Return
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'

        await createLoginSession(
            userId,
            signInData.session!.access_token,
            userAgent,
            'firebase_otp',
            'success'
        )

        // Fetch full profile for return
        const { data: userProfile } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        return { user: userProfile || undefined }
    } catch (error: any) {
        console.error('Verify Action Error:', error)
        return { error: error.message || 'Verification failed.' }
    }
}
