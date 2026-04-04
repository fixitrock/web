import { siteSuggestions } from './site.suggestions'
import { siteThemes } from './site.themes'
import type { MetaThemeColors, SiteConfig } from './site.types'

export const defaultSiteUrl = 'https://fixitrock.com'

export const resolvedSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl

export const META_THEME_COLORS = {
    light: '#ffffff',
    dark: '#000000',
} satisfies MetaThemeColors

export const siteConfig: SiteConfig = {
    title: 'Fix iT Rock',
    tagline: 'My tagline',
    description:
        'We Provide Mobile Firmwares Drivers Flash Tool FRP Dump File EMMC ISP PinOut Samsung MDM File Windows Files.',
    domain: resolvedSiteUrl,
    baseDirectory: 'Space',
    directoryUrl: '/space',
    redirectUri: `${resolvedSiteUrl}/oauth`,
    cacheControlHeader: 'max-age=0, s-maxage=60, stale-while-revalidate',
    isDev: process.env.NODE_ENV === 'development',
    suggestion: siteSuggestions,
    themes: siteThemes,
}
