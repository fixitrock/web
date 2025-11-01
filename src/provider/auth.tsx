'use client'

import { useEffect, ReactNode } from 'react'

import { createClient } from '@/supabase/client'
import { logout as serverLogout } from '@/actions/user'
import { useAuth, useEvent } from '@/zustand/store'

export function AuthProvider({ children }: { children: ReactNode }) {
    const setLogout = useAuth((s) => s.setLogout)

    const { trigger } = useEvent()

    useEffect(() => {
        const logout = async () => {
            await serverLogout()

            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const channel = new BroadcastChannel('auth')

                channel.postMessage({ type: 'logout' })
                channel.close()
            }

            window.location.reload()
        }

        setLogout(logout)

        if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel('auth')

            channel.onmessage = (event) => {
                if (event.data?.type === 'logout') {
                    window.location.reload()
                }
            }

            return () => channel.close()
        }
    }, [setLogout])

    useEffect(() => {
        const supabase = createClient()
        const { data: authListener } = supabase.auth.onAuthStateChange((event, _session) => {
            if (event === 'SIGNED_OUT') {
                window.location.reload()
            }

            if (event === 'TOKEN_REFRESHED' && !_session) {
                window.location.reload()
            }
        })

        const channel = supabase
            .channel('realtime:all')
            .on('postgres_changes', { event: '*', schema: 'public', table: '*' }, (_payload) => {
                trigger()
            })
            .subscribe()

        return () => {
            try {
                ;(authListener as any)?.subscription?.unsubscribe?.()
                ;(authListener as any)?.unsubscribe?.()
            } catch {}

            supabase.removeChannel(channel)
        }
    }, [trigger])

    return children
}
