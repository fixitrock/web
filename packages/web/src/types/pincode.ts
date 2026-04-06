export type PincodeResult = {
    state: string
    district: string
}

export type PincodeFetcher = (code: string) => Promise<PincodeResult | null>
