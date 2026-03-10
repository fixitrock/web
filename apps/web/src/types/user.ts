import { z } from 'zod'

export const UserPropsSchema = z.object({
    name: z.string(),
    username: z.string(),
    bio: z.string(),
    location: z.string(),
    birthdate: z.string(),
    gender: z.string(),
    number: z.string(),
    followers: z.number(),
    following: z.number(),
})

export type UserProps = z.infer<typeof UserPropsSchema>

export const GallerySchema = z.object({
    name: z.string(),
    thumbnail: z.string().url(),
})

export type GalleryProps = z.infer<typeof GallerySchema>

export type Quote = {
    id: number
    quote: string
    username: string
    lastModifiedDateTime: string
}

export interface UserLoginSession {
    id: string
    user_id: string // This will be UUID from auth.users
    session_id: string
    device_type?: string
    device_name?: string
    browser?: string
    browser_version?: string
    os?: string
    os_version?: string
    user_agent?: string
    ip_address?: string
    location_country?: string
    location_city?: string
    location_region?: string
    location_lat?: number
    location_lng?: number
    isp?: string
    timezone?: string
    login_method: string
    login_status: 'success' | 'failed' | 'blocked'
    created_at: string
    expires_at?: string
    last_activity: string
    is_active: boolean
}

export interface DeviceInfo {
    deviceType: string
    deviceName: string
    browser: string
    browserVersion: string
    os: string
    osVersion: string
    userAgent: string
}

export interface LocationInfo {
    ip: string
    country?: string
    city?: string
    region?: string
    lat?: number
    lng?: number
    isp?: string
    timezone?: string
}
