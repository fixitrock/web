'use client'

import { useEffect, useCallback } from 'react'

import { updateSessionActivity, deactivateSession } from '@/actions/user/login'
import { getClientDeviceInfo } from '@/lib/utils/deviceDetection'

export function useSessionTracking(sessionId?: string) {
    const updateActivity = useCallback(async () => {
        if (sessionId) {
            await updateSessionActivity(sessionId)
        }
    }, [sessionId])

    const revokeSession = useCallback(async () => {
        if (sessionId) {
            await deactivateSession(sessionId)
        }
    }, [sessionId])

    useEffect(() => {
        if (!sessionId) return

        // Update activity on page load
        updateActivity()

        // Update activity on user interaction
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        const handleActivity = () => {
            updateActivity()
        }

        events.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true })
        })

        // Update activity every 5 minutes
        const interval = setInterval(updateActivity, 5 * 60 * 1000)

        // Cleanup on page unload
        const handleBeforeUnload = () => {
            updateActivity()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity)
            })
            clearInterval(interval)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [sessionId, updateActivity])

    return {
        updateActivity,
        revokeSession,
    }
}

export function useDeviceInfo() {
    return getClientDeviceInfo()
}
