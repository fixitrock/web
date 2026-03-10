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

export type TeamMembers = TeamMember[]
