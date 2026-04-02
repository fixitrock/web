import { createClient, type Session } from '@supabase/supabase-js'
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'

import type { User } from '@/app/login/types'
import { adminAuth } from '@/firebase/admin'

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
        const [ivBase64, tagBase64, encryptedBase64] = parts as [string, string, string]
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

export async function exchangeFirebaseIdToken(
    idToken: string
): Promise<{ user?: User | null; session?: Session; error?: string }> {
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

        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const phone = decodedToken.phone_number

        if (!phone) {
            return { error: 'No phone number found in Firebase token.' }
        }

        let profileId: string | undefined
        let authUserId: string | undefined

        const phoneClean = phone.replace('+', '')

        const { data: existingProfile } = await supabaseAdmin
            .from('users')
            .select('id, auth_id')
            .or(`phone.eq.${phone},phone.eq.${phoneClean}`)
            .maybeSingle()

        if (existingProfile) {
            profileId = existingProfile.id
            authUserId = existingProfile.auth_id ?? undefined
        }

        if (!authUserId) {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser(
                {
                    phone,
                    phone_confirm: true,
                }
            )

            if (newUser.user) {
                authUserId = newUser.user.id
            } else if (
                createError?.code === 'phone_exists' ||
                createError?.message?.includes('registered')
            ) {
                const {
                    data: { users },
                } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
                const targetSimple = phone.replace(/\D/g, '').slice(-10)
                const zombie = users.find((user) =>
                    user.phone?.replace(/\D/g, '')?.includes(targetSimple)
                )

                if (!zombie) {
                    return { error: 'Account stuck in invalid state. Please contact support.' }
                }

                authUserId = zombie.id
            } else {
                return { error: 'Failed to create account.' }
            }
        }

        if (profileId && authUserId && !existingProfile?.auth_id) {
            await supabaseAdmin.from('users').update({ auth_id: authUserId }).eq('id', profileId)
        }

        if (!authUserId) {
            return { error: 'User identification failed.' }
        }

        const { data: authUserData, error: authUserError } =
            await supabaseAdmin.auth.admin.getUserById(authUserId)

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
            loginSecret = `${randomUUID()}-login`
            const encryptedSecret = encryptLoginSecret(loginSecret)

            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                authUserId,
                {
                    password: loginSecret,
                    phone_confirm: true,
                    user_metadata: { ...existingMetadata, login_secret: encryptedSecret },
                }
            )

            if (updateError) {
                return { error: 'Login preparation failed.' }
            }
        }

        const { data: signInData, error: signInError } =
            await supabaseAdmin.auth.signInWithPassword({
                phone,
                password: loginSecret,
            })

        let session = signInData.session ?? null

        if (signInError || !session) {
            const { data: retryData, error: retryError } =
                await supabaseAdmin.auth.signInWithPassword({
                    phone: phoneClean,
                    password: loginSecret,
                })

            if (retryError || !retryData.session) {
                return { error: 'Login failed.' }
            }

            session = retryData.session
        }

        let userProfile: User | null = null
        if (profileId) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', profileId)
                .maybeSingle()
            userProfile = (data as User | null) ?? null
        } else {
            const { data } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('auth_id', authUserId)
                .maybeSingle()
            userProfile = (data as User | null) ?? null
        }

        return {
            user: userProfile,
            session,
        }
    } catch (error: any) {
        console.error('Firebase exchange error:', error)
        return { error: error.message || 'Verification failed.' }
    }
}
