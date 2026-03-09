'use server'

import { cookies } from 'next/headers'

import { User } from '@/app/login/types'
import { adminAuth } from '@/firebase/admin'
import { createClient } from '@/supabase/server'
import { TeamMember } from '@/types/teams'
import { Notification } from '@/types/users'
import { withErrorHandling } from '@/lib/utils'

const userSession = withErrorHandling(async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
        throw new Error('Not authenticated')
    }

    try {
        const decoded = await adminAuth.verifyIdToken(token)
        const uid = decoded.uid

        const supabase = await createClient()
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .single()

        if (error || !user) {
            throw new Error('User not found')
        }

        return user as User
    } catch {
        throw new Error('Authentication failed')
    }
})

// 1. Invite (create) member
export const inviteMember = withErrorHandling(
    async ({
        user_id,
        job_title,
    }: {
        user_id: string
        job_title?: string
    }): Promise<TeamMember | null> => {
        const currentUser = await userSession()

        if (![2, 3].includes(currentUser.role as number)) throw new Error('Not authorized')
        const supabase = await createClient()
        const team_username = currentUser.username
        const { data, error } = await supabase
            .from('team_members')
            .insert([
                {
                    team_id: currentUser.id,
                    team_username,
                    user_id,
                    job_title,
                    status: 'pending',
                    invited_by: currentUser.id,
                },
            ])
            .select()
            .single()

        if (error) throw new Error(error.message)

        return data as TeamMember
    }
)

// 1. Invite user to team and create notification
export const inviteUserToTeam = withErrorHandling(
    async ({
        team_id,
        team_username,
        user_id,
        job_title,
        invited_by,
        invited_by_name,
        invited_by_avatar,
    }: {
        team_id: string
        team_username: string
        user_id: string
        job_title?: string
        invited_by: string
        invited_by_name: string
        invited_by_avatar?: string
    }): Promise<{ member: TeamMember; notification: Notification }> => {
        const supabase = await createClient()

        // 1. Insert into team_members
        const { data: member, error: memberError } = await supabase
            .from('team_members')
            .insert([
                {
                    team_id,
                    team_username,
                    user_id,
                    job_title,
                    status: 'pending',
                    invited_by,
                },
            ])
            .select()
            .single()

        if (memberError) throw new Error(memberError.message)

        // 2. Create notification
        const { data: notification, error: notificationError } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id,
                    title: 'Team Invitation',
                    message: `${invited_by_name} invited you to join their team`,
                    type: 'team_invitation',
                    data: {
                        team_id,
                        team_username,
                        invited_by,
                        invited_by_name,
                        invited_by_avatar,
                    },
                },
            ])
            .select()
            .single()

        if (notificationError) throw new Error(notificationError.message)

        return { member: member as TeamMember, notification: notification as Notification }
    }
)

// 2. Edit member
export const updateMember = withErrorHandling(
    async ({
        id,
        job_title,
        status,
    }: {
        id: number
        job_title?: string
        status?: 'pending' | 'accepted' | 'rejected'
    }): Promise<TeamMember | null> => {
        const currentUser = await userSession()
        const supabase = await createClient()
        const { data: member } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', id)
            .single()

        if (
            !member ||
            (status &&
                status !== 'pending' &&
                member.user_id !== currentUser.id &&
                member.team_id !== currentUser.id)
        ) {
            throw new Error('Not authorized')
        }
        const { data, error } = await supabase
            .from('team_members')
            .update({
                ...(job_title && { job_title }),
                ...(status && { status }),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        return data as TeamMember
    }
)

// 3. Delete member
export const deleteMember = withErrorHandling(async (id: number): Promise<boolean> => {
    const currentUser = await userSession()
    const supabase = await createClient()
    const { data: member } = await supabase.from('team_members').select('*').eq('id', id).single()

    if (!member || member.team_id !== currentUser.id) throw new Error('Not authorized')
    const { error } = await supabase.from('team_members').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return true
})

// 4. Fetch members by team (shopkeeper/admin) id
export const getMembers = withErrorHandling(async (team_id: string): Promise<TeamMember[]> => {
    const currentUser = await userSession()

    if (currentUser.id !== team_id) throw new Error('Not authorized')
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team_id)
        .eq('status', 'accepted')

    if (error) throw new Error(error.message)

    return data as TeamMember[]
})

// 4. Get all accepted team members for a team
export const getTeamMembers = withErrorHandling(async (team_id: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team_id)
        .eq('status', 'accepted')

    if (error) throw new Error(error.message)

    return data // array of TeamMember
})

// 5. Search users (role 1) by username/phone
export const searchUsers = withErrorHandling(async (query: string): Promise<User[]> => {
    const currentUser = await userSession()

    if (![2, 3].includes(currentUser.role as number)) throw new Error('Not authorized')
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,phone.ilike.%${query}%`)
        .eq('role', 1)

    if (error) throw new Error(error.message)

    return (data as User[]) || []
})

// 5. Get all teams where user is an accepted member
export const getUserTeams = withErrorHandling(async (user_id: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'accepted')

    if (error) throw new Error(error.message)

    return data // array of TeamMember
})

// Fetch pending invites for a user
export const getPendingInvitesForUser = withErrorHandling(async (user_id: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'pending')

    if (error) throw new Error(error.message)

    return data as TeamMember[]
})

// Fetch count of pending invites for a user
export const getPendingInvitesCount = withErrorHandling(async (user_id: string) => {
    const supabase = await createClient()
    const { count, error } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .eq('status', 'pending')

    if (error) throw new Error(error.message)

    return count || 0
})

// 2. Get all notifications for a user
export const getUserNotifications = withErrorHandling(async (user_id: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return data // array of Notification
})

// 3. Respond to a team request (accept/reject)
export const respondToTeamRequest = withErrorHandling(
    async ({
        team_member_id,
        status,
    }: {
        team_member_id: number
        status: 'accepted' | 'rejected'
    }) => {
        const supabase = await createClient()
        // 1. Update team_members
        const { error: memberError } = await supabase
            .from('team_members')
            .update({ status })
            .eq('id', team_member_id)

        if (memberError) throw new Error(memberError.message)

        // 2. Mark notification as read
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('data->>team_member_id', team_member_id.toString())
            .eq('type', 'team_request')
    }
)
