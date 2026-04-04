import type { ElementType } from 'react'

export type SiteIcon = ElementType

export type SiteThemeMode = 'light' | 'system' | 'dark'

export interface SiteSuggestion {
    href: string
    title: string
    description: string
    icon: SiteIcon
}

export interface SiteTheme {
    title: string
    theme: SiteThemeMode
    description: string
    icon: SiteIcon
}

export interface SiteConfig {
    title: string
    tagline: string
    description: string
    domain: string
    baseDirectory: string
    directoryUrl: string
    redirectUri: string
    cacheControlHeader: string
    isDev: boolean
    suggestion: readonly SiteSuggestion[]
    themes: readonly SiteTheme[]
}

export interface SiteFallback {
    order: string
    recentOrder: string
    brand: string
    brandSearch: string
    category: string
    categorySearch: string
    user: string
}

export interface StorageOption {
    name: string
}

export interface MetaThemeColors {
    light: string
    dark: string
}
