export type CustomerAddress = {
    city?: string
    district?: string
    state?: string
    pincode?: number
    country?: string
}

export type CustomerInput = {
    id?: number | string
    phone: string
    name: string
    address?: CustomerAddress | null
    avatar?: string
    gender?: string
    active?: boolean
}
