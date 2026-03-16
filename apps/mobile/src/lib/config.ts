import { Platform } from 'react-native'

const rawSiteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const appConfig = {
    appName: 'Fix iT Rock',
    countryCode: '+91',
    supportPhone: '+919927241144',
    firebaseBridgePath: '/mobile/auth/firebase',
}

export function getRuntimeSiteUrl() {
    if (Platform.OS === 'android' && rawSiteUrl.includes('://localhost')) {
        return rawSiteUrl.replace('://localhost', '://10.0.2.2')
    }

    return rawSiteUrl
}

export function makeWebUrl(path: string) {
    return new URL(path, getRuntimeSiteUrl()).toString()
}
