'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { createClient } from '@/supabase/client'

const INVALIDATION_DEBOUNCE_MS = 200

export function RealtimeInvalidationProvider() {
    const queryClient = useQueryClient()
    const invalidateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel('realtime:query-invalidation')
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                if (invalidateTimeout.current) {
                    clearTimeout(invalidateTimeout.current)
                }

                invalidateTimeout.current = setTimeout(() => {
                    queryClient.invalidateQueries()
                    invalidateTimeout.current = null
                }, INVALIDATION_DEBOUNCE_MS)
            })
            .subscribe()

        return () => {
            if (invalidateTimeout.current) {
                clearTimeout(invalidateTimeout.current)
                invalidateTimeout.current = null
            }

            supabase.removeChannel(channel)
        }
    }, [queryClient])

    return null
}
