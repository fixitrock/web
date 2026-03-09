export type LoginStep = 'phone' | 'otp' | 'details'

export type User = {
    id: string
    phone: string
    name: string | null
    username: string | null
    gender: string | null
    dob: string | null
    active: boolean
    avatar?: string | null
    bio?: string | null // max 160 chars
    location?: string | null
    location_url?: string | null
    cover?: string | null
    verified: boolean
    created_at: string
    updated_at: string
}

export type NotificationType = 'team_request' | 'follow' | 'comment' | 'like' | 'other'

export type Notification = {
    id: number
    user_id: string
    type: NotificationType
    data: JSON
    is_read: boolean
    created_at: string
}

export type TeamMember = {
    id: number
    team_id: string
    team_username: string
    user_id: string
    job_title?: string
    status: 'pending' | 'accepted' | 'rejected'
    invited_by?: string
    created_at: string
    updated_at: string
}
