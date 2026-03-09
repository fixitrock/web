import { LocationInfo } from '@/types/user'

export async function getLocationFromIP(ip: string): Promise<LocationInfo> {
    try {
        // Using ipapi.co for geolocation (free tier available)
        const response = await fetch(`https://ipapi.co/${ip}/json/`)
        const data = await response.json()

        return {
            ip,
            country: data.country_name,
            city: data.city,
            region: data.region,
            lat: data.latitude,
            lng: data.longitude,
            isp: data.org,
            timezone: data.timezone,
        }
    } catch {
        return { ip }
    }
}

export async function getClientIP(): Promise<string> {
    try {
        // For client-side, we'll use a service to get the public IP
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()

        return data.ip
    } catch {
        return 'unknown'
    }
}

export async function getClientLocation(): Promise<LocationInfo> {
    const ip = await getClientIP()

    return getLocationFromIP(ip)
}

// Server-side function to get IP from request headers
export function getIPFromRequest(headers: Headers): string {
    // Check various headers for IP address
    const forwarded = headers.get('x-forwarded-for')
    const realIP = headers.get('x-real-ip')
    const cfConnectingIP = headers.get('cf-connecting-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    if (realIP) {
        return realIP
    }
    if (cfConnectingIP) {
        return cfConnectingIP
    }

    return 'unknown'
}
