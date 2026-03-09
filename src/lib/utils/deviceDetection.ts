import { DeviceInfo } from '@/types/user'

export function detectDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase()

    // Detect OS
    let os = 'Unknown'
    let osVersion = ''

    if (ua.includes('windows')) {
        os = 'Windows'
        if (ua.includes('windows nt 10.0')) osVersion = '10'
        else if (ua.includes('windows nt 6.3')) osVersion = '8.1'
        else if (ua.includes('windows nt 6.2')) osVersion = '8'
        else if (ua.includes('windows nt 6.1')) osVersion = '7'
    } else if (ua.includes('mac os x')) {
        os = 'macOS'
        const match = ua.match(/mac os x (\d+[._]\d+)/)

        if (match) osVersion = match[1].replace('_', '.')
    } else if (ua.includes('linux')) {
        os = 'Linux'
    } else if (ua.includes('android')) {
        os = 'Android'
        const match = ua.match(/android (\d+\.\d+)/)

        if (match) osVersion = match[1]
    } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        os = 'iOS'
        const match = ua.match(/os (\d+[._]\d+)/)

        if (match) osVersion = match[1].replace('_', '.')
    }

    // Detect Browser
    let browser = 'Unknown'
    let browserVersion = ''

    if (ua.includes('chrome') && !ua.includes('edg')) {
        browser = 'Chrome'
        const match = ua.match(/chrome\/(\d+\.\d+)/)

        if (match) browserVersion = match[1]
    } else if (ua.includes('firefox')) {
        browser = 'Firefox'
        const match = ua.match(/firefox\/(\d+\.\d+)/)

        if (match) browserVersion = match[1]
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
        browser = 'Safari'
        const match = ua.match(/version\/(\d+\.\d+)/)

        if (match) browserVersion = match[1]
    } else if (ua.includes('edge')) {
        browser = 'Edge'
        const match = ua.match(/edge\/(\d+\.\d+)/)

        if (match) browserVersion = match[1]
    } else if (ua.includes('opera')) {
        browser = 'Opera'
        const match = ua.match(/opera\/(\d+\.\d+)/)

        if (match) browserVersion = match[1]
    }

    // Detect Device Type
    let deviceType = 'desktop'
    let deviceName = 'Desktop'

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceType = 'mobile'
        if (ua.includes('iphone')) {
            deviceName = 'iPhone'
            const match = ua.match(/iphone\s+os\s+(\d+)/)

            if (match) {
                const version = parseInt(match[1])

                if (version >= 17) deviceName = 'iPhone 15'
                else if (version >= 16) deviceName = 'iPhone 14'
                else if (version >= 15) deviceName = 'iPhone 13'
                else deviceName = 'iPhone'
            }
        } else if (ua.includes('android')) {
            deviceName = 'Android Phone'
        }
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet'
        if (ua.includes('ipad')) {
            deviceName = 'iPad'
        } else {
            deviceName = 'Android Tablet'
        }
    } else if (ua.includes('macintosh')) {
        deviceName = 'Mac'
    } else if (ua.includes('windows')) {
        deviceName = 'Windows PC'
    }

    return {
        deviceType,
        deviceName,
        browser,
        browserVersion,
        os,
        osVersion,
        userAgent,
    }
}

export function getClientDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
        return {
            deviceType: 'unknown',
            deviceName: 'Unknown',
            browser: 'Unknown',
            browserVersion: '',
            os: 'Unknown',
            osVersion: '',
            userAgent: '',
        }
    }

    return detectDevice(navigator.userAgent)
}
