import { create } from 'zustand'

import type { PincodeFetcher, PincodeResult } from '../types/pincode'

export interface PinCodeStoreState {
    cache: Record<string, PincodeResult>
    fetcher: PincodeFetcher | null
    setFetcher: (fetcher: PincodeFetcher | null) => void
    fetchPincode: (code: string) => Promise<PincodeResult | null>
}

export const usePinCodeStore = create<PinCodeStoreState>((set, get) => ({
    cache: {},
    fetcher: null,
    setFetcher: (fetcher) => set({ fetcher }),
    fetchPincode: async (code) => {
        if (!code || code.length !== 6) return null

        const cached = get().cache[code]
        if (cached) return cached

        const fetcher = get().fetcher
        if (!fetcher) return null

        const data = await fetcher(code)

        if (data) {
            set((state) => ({
                cache: {
                    ...state.cache,
                    [code]: data,
                },
            }))
        }

        return data
    },
}))
