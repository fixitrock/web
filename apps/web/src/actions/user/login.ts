'use server'

import { headers } from 'next/headers'

import { createClient } from '@/supabase/server'
import { UserLoginSession } from '@/types/user'
import { detectDevice } from '@/lib/utils/deviceDetection'
import { getLocationFromIP, getIPFromRequest } from '@/lib/utils/geoLocation'

export async function createLoginSession(
    userId: string,
    sessionId: string,
    userAgent: string,
    loginMethod: string = 'phone_otp',
    loginStatus: 'success' | 'failed' | 'blocked' = 'success'
): Promise<UserLoginSession | null> {
    try {
        const supabase = await createClient()
        const headersList = await headers()

        // Get IP address from request headers
        const ipAddress = getIPFromRequest(headersList)

        // Detect device information
        const deviceInfo = detectDevice(userAgent)

        // Get location information
        const locationInfo = await getLocationFromIP(ipAddress)

        // Create session data
        const sessionData = {
            user_id: userId,
            session_id: sessionId,
            device_type: deviceInfo.deviceType,
            device_name: deviceInfo.deviceName,
            browser: deviceInfo.browser,
            browser_version: deviceInfo.browserVersion,
            os: deviceInfo.os,
            os_version: deviceInfo.osVersion,
            user_agent: userAgent,
            ip_address: ipAddress,
            location_country: locationInfo.country,
            location_city: locationInfo.city,
            location_region: locationInfo.region,
            location_lat: locationInfo.lat,
            location_lng: locationInfo.lng,
            isp: locationInfo.isp,
            timezone: locationInfo.timezone,
            login_method: loginMethod,
            login_status: loginStatus,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            is_active: true,
        }

        // Insert session into database
        const { data, error } = await supabase
            .from('user_login_sessions')
            .insert(sessionData)
            .select()
            .single()

        if (error) {
            return null
        }

        // Update user's last login information
        await supabase
            .from('users')
            .update({
                last_login_at: new Date().toISOString(),
                last_login_ip: ipAddress,
                last_login_device: deviceInfo.deviceName,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

        return data as UserLoginSession
    } catch {
        return null
    }
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
    try {
        const supabase = await createClient()

        await supabase
            .from('user_login_sessions')
            .update({
                last_activity: new Date().toISOString(),
            })
            .eq('session_id', sessionId)
    } catch {
        // Silent failure for activity updates
    }
}

export async function deactivateSession(sessionId: string): Promise<void> {
    try {
        const supabase = await createClient()

        await supabase
            .from('user_login_sessions')
            .update({
                is_active: false,
                last_activity: new Date().toISOString(),
            })
            .eq('session_id', sessionId)
    } catch {
        // Silent failure for session deactivation
    }
}

export async function getUserLoginSessions(userId: string): Promise<UserLoginSession[]> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_login_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            return []
        }

        return data as UserLoginSession[]
    } catch {
        return []
    }
}

export async function getActiveSessions(userId: string): Promise<UserLoginSession[]> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_login_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('last_activity', { ascending: false })

        if (error) {
            return []
        }

        return data as UserLoginSession[]
    } catch {
        return []
    }
}

export async function revokeAllSessions(userId: string): Promise<void> {
    try {
        const supabase = await createClient()

        await supabase
            .from('user_login_sessions')
            .update({
                is_active: false,
                last_activity: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('is_active', true)
    } catch {
        // Silent failure for session revocation
    }
}
