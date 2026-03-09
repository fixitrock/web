import { create } from 'zustand'

const LOGIN_TOUR_KEY = 'tour-login-tooltip-seen'

interface TourState {
    hasInitializedLoginTour: boolean
    isLoginTooltipOpen: boolean
    initializeLoginTour: (isLoggedIn: boolean) => void
    closeLoginTooltip: () => void
}

export const useTourStore = create<TourState>((set, get) => ({
    hasInitializedLoginTour: false,
    isLoginTooltipOpen: false,
    initializeLoginTour: (isLoggedIn) => {
        if (get().hasInitializedLoginTour || typeof window === 'undefined') {
            return
        }

        const hasSeenTour = localStorage.getItem(LOGIN_TOUR_KEY) === '1'

        if (hasSeenTour || isLoggedIn) {
            if (!hasSeenTour) {
                localStorage.setItem(LOGIN_TOUR_KEY, '1')
            }

            set({
                hasInitializedLoginTour: true,
                isLoginTooltipOpen: false,
            })
            return
        }

        localStorage.setItem(LOGIN_TOUR_KEY, '1')
        set({
            hasInitializedLoginTour: true,
            isLoginTooltipOpen: true,
        })
    },
    closeLoginTooltip: () => set({ isLoginTooltipOpen: false }),
}))
