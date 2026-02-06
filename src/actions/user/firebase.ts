'use server'

import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'

import { adminAuth } from '@/firebase/admin'
import { createLoginSession } from '@/actions/user/login'
import { User } from '@/app/login/types'

const LOGIN_SECRET_KEY = process.env.RET

function getSecretKey() {
    if (!LOGIN_SECRET_KEY) {
        throw new Error('Missing RET environment variable for login secret encryption.')
    }

    return createHash('sha256').update(LOGIN_SECRET_KEY).digest()
}

function encryptLoginSecret(secret: string) {
    const key = getSecretKey()
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`
}

function decryptLoginSecret(payload?: string | null) {
    if (!payload) return null

    const parts = payload.split('.')
    if (parts.length !== 3) return null

    try {
        const [ivBase64, tagBase64, encryptedBase64] = parts
        const key = getSecretKey()
        const iv = Buffer.from(ivBase64, 'base64')
        const tag = Buffer.from(tagBase64, 'base64')
        const encrypted = Buffer.from(encryptedBase64, 'base64')
        const decipher = createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(tag)
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

        return decrypted.toString('utf8')
    } catch {
        return null
    }
}

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

        // 5. Mint Session (Stable Password Strategy)
        if (!userId) return { error: 'User identification failed.' }

        const { data: authUserData, error: authUserError } =
            await supabaseAdmin.auth.admin.getUserById(userId)
        if (authUserError || !authUserData?.user) {
            return { error: 'User lookup failed.' }
        }

        const existingMetadata = authUserData.user.user_metadata ?? {}
        const existingEncryptedSecret =
            typeof existingMetadata.login_secret === 'string'
                ? (existingMetadata.login_secret as string)
                : null
        let loginSecret = decryptLoginSecret(existingEncryptedSecret)

        if (!loginSecret) {
            if (!LOGIN_SECRET_KEY) {
                return { error: 'Server configuration error.' }
            }

            loginSecret = `${randomUUID()}-login`
            const encryptedSecret = encryptLoginSecret(loginSecret)

            // Set password once and persist encrypted secret for future logins
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: loginSecret,
                phone_confirm: true,
                user_metadata: { ...existingMetadata, login_secret: encryptedSecret },
            })
            if (updateError) {
                return { error: 'Login preparation failed.' }
            }
        }

        // Sign In
        const { data: signInData, error: signInError } =
            await supabaseAdmin.auth.signInWithPassword({
                phone: phone, // Try E.164 first
                password: loginSecret,
            })

        if (signInError || !signInData.session) {
            // Retry with clean phone if first attempt failed (edge case)
            const { data: retryData, error: retryError } =
                await supabaseAdmin.auth.signInWithPassword({
                    phone: phoneClean,
                    password: loginSecret,
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
