import { useEffect, useCallback, useRef } from 'react'

import { useDownloadStore } from '@/zustand/store/download'
import { logWarning } from '@/lib/utils'

const NOTIFICATION_CONFIG = {
    title: 'Downloads Running',
    icon: '/favicon.ico',
    tag: 'download-warning',
    timeout: 5000,
} as const

const canShowNotification = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted'
}

const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()

        return permission === 'granted'
    }

    return Notification.permission === 'granted'
}

const showNotification = (message: string): void => {
    try {
        if (canShowNotification()) {
            const existingNotification = document.querySelector(
                `[data-notification-tag="${NOTIFICATION_CONFIG.tag}"]`
            )

            if (existingNotification) {
                existingNotification.remove()
            }

            const notification = new Notification(NOTIFICATION_CONFIG.title, {
                body: message,
                icon: NOTIFICATION_CONFIG.icon,
                tag: NOTIFICATION_CONFIG.tag,
                requireInteraction: false,
                silent: false,
            })

            setTimeout(() => {
                notification.close()
            }, NOTIFICATION_CONFIG.timeout)

            notification.onclick = () => {
                window.focus()
                notification.close()
            }
        }
    } catch (error) {
        logWarning('Failed to show notification:', error)
    }
}

export function useDownloadWarning() {
    const { getActiveDownloads } = useDownloadStore()
    const notificationShownRef = useRef(false)
    const lastDownloadCountRef = useRef(0)

    const handleBeforeUnload = useCallback(
        (event: BeforeUnloadEvent) => {
            try {
                const activeDownloads = getActiveDownloads()

                if (activeDownloads.length > 0) {
                    event.preventDefault()

                    return `You have ${activeDownloads.length} active download(s) running. Closing this page will cancel all downloads.`
                }
            } catch (error) {
                logWarning('Error in beforeunload handler:', error)
            }
        },
        [getActiveDownloads]
    )

    const handleVisibilityChange = useCallback(async () => {
        try {
            if (document.visibilityState === 'hidden') {
                const activeDownloads = getActiveDownloads()
                const currentCount = activeDownloads.length

                if (currentCount > 0 && currentCount !== lastDownloadCountRef.current) {
                    if (
                        !notificationShownRef.current ||
                        currentCount !== lastDownloadCountRef.current
                    ) {
                        const hasPermission = await requestNotificationPermission()

                        if (hasPermission) {
                            const message = `${currentCount} download(s) are still running in the background`

                            showNotification(message)
                            notificationShownRef.current = true
                        }
                    }

                    lastDownloadCountRef.current = currentCount
                }
            } else if (document.visibilityState === 'visible') {
                notificationShownRef.current = false
            }
        } catch (error) {
            logWarning('Error in visibility change handler:', error)
        }
    }, [getActiveDownloads])

    useEffect(() => {
        requestNotificationPermission().catch((error) => {
            logWarning('Failed to request notification permission:', error)
        })

        try {
            window.addEventListener('beforeunload', handleBeforeUnload, { passive: false })
            document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
        } catch (error) {
            logWarning('Failed to add event listeners:', error)
        }

        return () => {
            try {
                window.removeEventListener('beforeunload', handleBeforeUnload)
                document.removeEventListener('visibilitychange', handleVisibilityChange)
            } catch (error) {
                logWarning('Error during cleanup:', error)
            }
        }
    }, [handleBeforeUnload, handleVisibilityChange])

    useEffect(() => {
        const activeDownloads = getActiveDownloads()
        const currentCount = activeDownloads.length

        if (currentCount === 0) {
            notificationShownRef.current = false
            lastDownloadCountRef.current = 0
        }
    }, [getActiveDownloads])
}
