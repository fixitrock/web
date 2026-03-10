import { create } from 'zustand'

import { getPinCode, PincodeResult } from '@/actions/user'

type PincodeStore = {
    cache: Record<string, PincodeResult>
    fetchPincode: (code: string) => Promise<PincodeResult | null>
}

export const usePinCodeStore = create<PincodeStore>((set, get) => ({
    cache: {},

    fetchPincode: async (code: string) => {
        const cached = get().cache[code]

        if (cached) return cached

        const data = await getPinCode(code)

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
