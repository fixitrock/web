import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import type { Session } from '@supabase/supabase-js'

import { makeWebUrl } from '@/src/lib/config'
import { supabase } from '@/src/lib/supabase'
import type { AppUser } from '@/src/types/user'

WebBrowser.maybeCompleteAuthSession()

type ActionResult = { error?: string }

type AuthContextValue = {
    session: Session | null
    profile: AppUser | null
    isReady: boolean
    isBusy: boolean
    isAuthenticated: boolean
    sendSupabaseOtp: (phone: string) => Promise<ActionResult>
    verifySupabaseOtp: (phone: string, token: string) => Promise<ActionResult>
    signInWithFirebase: (phone: string) => Promise<ActionResult>
    completeFirebaseCallback: (url: string) => Promise<ActionResult>
    refreshProfile: () => Promise<void>
    signOut: () => Promise<ActionResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseCallback(url: string) {
    const parsed = new URL(url)
    const error =
        parsed.searchParams.get('error_description') ??
        parsed.searchParams.get('error') ??
        undefined

    return {
        error,
        accessToken: parsed.searchParams.get('access_token'),
        refreshToken: parsed.searchParams.get('refresh_token'),
    }
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<AppUser | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [isBusy, setIsBusy] = useState(false)

    const loadProfile = useCallback(async (activeSession: Session | null) => {
        if (!activeSession) {
            setProfile(null)
            return
        }

        const authId = activeSession.user.id
        const { data } = await supabase
            .from('users')
            .select(
                'id, auth_id, name, username, phone, avatar, bio, location, verified, active, created_at, updated_at, role'
            )
            .eq('auth_id', authId)
            .maybeSingle()

        if (data) {
            setProfile(data as AppUser)
            return
        }

        setProfile({
            id: authId,
            auth_id: authId,
            phone: activeSession.user.phone ?? null,
            name: activeSession.user.user_metadata?.name ?? 'Fix iT Rock user',
            username: activeSession.user.user_metadata?.username ?? null,
            verified: Boolean(activeSession.user.phone_confirmed_at),
            active: true,
        })
    }, [])

    useEffect(() => {
        let mounted = true

        const bootstrap = async () => {
            const {
                data: { session: initialSession },
            } = await supabase.auth.getSession()

            if (!mounted) {
                return
            }

            setSession(initialSession)
            await loadProfile(initialSession)
            if (mounted) {
                setIsReady(true)
            }
        }

        void bootstrap()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession)
            void loadProfile(nextSession)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [loadProfile])

    const sendSupabaseOtp = useCallback(async (phone: string) => {
        setIsBusy(true)
        const { error } = await supabase.auth.signInWithOtp({ phone })
        setIsBusy(false)

        if (error) {
            return { error: error.message }
        }

        return {}
    }, [])

    const verifySupabaseOtp = useCallback(
        async (phone: string, token: string) => {
            setIsBusy(true)
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            })

            setIsBusy(false)

            if (error) {
                return { error: error.message }
            }

            setSession(data.session ?? null)
            await loadProfile(data.session ?? null)

            return {}
        },
        [loadProfile]
    )

    const completeFirebaseCallback = useCallback(
        async (url: string) => {
            const { error, accessToken, refreshToken } = parseCallback(url)

            if (error) {
                return { error }
            }

            if (!accessToken || !refreshToken) {
                return { error: 'Missing Supabase session in Firebase callback.' }
            }

            setIsBusy(true)
            const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            })
            setIsBusy(false)

            if (sessionError) {
                return { error: sessionError.message }
            }

            setSession(data.session)
            await loadProfile(data.session)

            return {}
        },
        [loadProfile]
    )

    const signInWithFirebase = useCallback(
        async (phone: string) => {
            setIsBusy(true)

            const returnUrl = Linking.createURL('/auth/callback')
            const authUrl = new URL(makeWebUrl('/mobile/auth/firebase'))

            authUrl.searchParams.set('redirect', returnUrl)
            authUrl.searchParams.set('phone', phone)

            const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), returnUrl)

            if (result.type !== 'success' || !result.url) {
                setIsBusy(false)
                return {
                    error:
                        result.type === 'cancel'
                            ? 'Firebase login was cancelled.'
                            : 'Could not complete Firebase login.',
                }
            }

            const callbackResult = await completeFirebaseCallback(result.url)
            setIsBusy(false)
            return callbackResult
        },
        [completeFirebaseCallback]
    )

    const refreshProfile = useCallback(async () => {
        await loadProfile(session)
    }, [loadProfile, session])

    const signOut = useCallback(async () => {
        setIsBusy(true)
        const { error } = await supabase.auth.signOut()
        setIsBusy(false)

        if (error) {
            return { error: error.message }
        }

        setSession(null)
        setProfile(null)
        return {}
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            profile,
            isReady,
            isBusy,
            isAuthenticated: Boolean(session),
            sendSupabaseOtp,
            verifySupabaseOtp,
            signInWithFirebase,
            completeFirebaseCallback,
            refreshProfile,
            signOut,
        }),
        [
            completeFirebaseCallback,
            isBusy,
            isReady,
            profile,
            refreshProfile,
            sendSupabaseOtp,
            session,
            signInWithFirebase,
            signOut,
            verifySupabaseOtp,
        ]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider.')
    }

    return context
}
