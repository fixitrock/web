import { create } from 'zustand'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

interface PwaState {
    deferredPrompt: BeforeInstallPromptEvent | null
    isInstallable: boolean
    isInstalled: boolean
    isStandalone: boolean
    isTooltipOpen: boolean
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void
    setIsInstallable: (isInstallable: boolean) => void
    setIsInstalled: (isInstalled: boolean) => void
    setTooltipOpen: (isOpen: boolean) => void
    installPWA: () => Promise<void>
    initialize: () => () => void
}

export const usePwaStore = create<PwaState>((set, get) => ({
    deferredPrompt: null,
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    isTooltipOpen: false,
    setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
    setIsInstallable: (isInstallable) => set({ isInstallable }),
    setIsInstalled: (isInstalled) => set({ isInstalled }),
    setTooltipOpen: (isOpen) => set({ isTooltipOpen: isOpen }),
    installPWA: async () => {
        const { deferredPrompt } = get()
        if (!deferredPrompt) return

        try {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                set({ isInstalled: true, isInstallable: false })
            }
            set({ deferredPrompt: null })
        } catch (error) {
            console.error('Install failed', error)
        }
    },
    initialize: () => {
        if (typeof window === 'undefined') return () => {}

        const checkIfInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            set({ isStandalone })
            if (isStandalone) {
                set({ isInstalled: true, isInstallable: false })
            }
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            set({
                deferredPrompt: e as BeforeInstallPromptEvent,
                isInstallable: true,
                isTooltipOpen: true,
            })

            // Auto close tooltip after 5 seconds
            setTimeout(() => {
                set({ isTooltipOpen: false })
            }, 5000)
        }

        const handleAppInstalled = () => {
            set({ isInstalled: true, isInstallable: false, deferredPrompt: null })
        }

        checkIfInstalled()
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    },
}))
