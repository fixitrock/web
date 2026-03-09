export type LoginStep = 'phone' | 'otp' | 'details'

export type User = {
    id: string
    name: string
    username: string
    phone: string
    gender?: 'male' | 'female' | 'other'
    dob?: string | null
    role?: number
    avatar?: string | null
    active: boolean
    created_at: string
    updated_at: string
    bio?: string | null // max 160 chars
    location?: string | null
    location_url?: string | null
    cover?: string | null
    verified: boolean
    showWhatsapp: boolean
    last_login_at: string
    last_login_ip: string
    last_login_device: string
    last_login_location: string
    address?: {
        city: string
        district: string
        state: string
        pincode?: number
        country: string
    } | null
}

export type TabsConfig = {
    title: string
    component: string
    description?: string
}
export type SlugConfig = {
    title?: string
    description?: string
    slug: string
    private?: boolean
    component: string
}

export type Navigation = {
    href: string
    icon: string
    title: string
    description?: string
}

export type Quotes = {
    id: number
    quote: string
    username: string
    lastModifiedDateTime?: string | null
}
