'use server'

export type PincodeResult = {
    state: string
    district: string
}

export async function getPinCode(code: string): Promise<PincodeResult | null> {
    if (!code || code.length !== 6) return null

    const apiKey = process.env.PINCODE_API_KEY
    const url = `https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=${apiKey}&format=json&limit=1&filters%5Bpincode%5D=${code}`

    const res = await fetch(url)

    if (!res.ok) return null

    const json = await res.json()
    const first = json.records?.[0]

    if (!first) return null

    return {
        state: first.statename,
        district: first.district,
    }
}
