'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { META_THEME_COLORS } from '@/config/site'

export function ThemeMetaTag() {
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta')
            metaThemeColor.setAttribute('name', 'theme-color')
            document.head.appendChild(metaThemeColor)
        }
        const color = resolvedTheme === 'dark' ? META_THEME_COLORS.dark : META_THEME_COLORS.light
        metaThemeColor.setAttribute('content', color)
        let appleStatusBar = document.querySelector(
            'meta[name="apple-mobile-web-app-status-bar-style"]'
        )

        if (!appleStatusBar) {
            appleStatusBar = document.createElement('meta')
            appleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
            document.head.appendChild(appleStatusBar)
        }

        appleStatusBar.setAttribute(
            'content',
            resolvedTheme === 'dark' ? 'black-translucent' : 'default'
        )
    }, [resolvedTheme])

    return null
}
