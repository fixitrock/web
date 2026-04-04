import { siteIcons } from './site.icons'
import type { SiteSuggestion } from './site.types'

export const siteSuggestions: readonly SiteSuggestion[] = [
    {
        href: '/',
        title: 'Home',
        description: 'Go to the main page',
        icon: siteIcons.home,
    },
    {
        href: '/space',
        title: 'Space',
        description: 'Download official firmware files for all mobile devices and brands',
        icon: siteIcons.repair,
    },
    {
        href: '/frp',
        title: 'FRP Bypass',
        description: 'Remove Factory Reset Protection and unlock your Android device',
        icon: siteIcons.unlock,
    },
    {
        href: '/space/iCloud',
        title: 'iCloud Bypass',
        description: 'Unlock iCloud locked devices with our reliable bypass solutions',
        icon: siteIcons.apple,
    },
    {
        href: '/space/Drivers',
        title: 'USB Drivers',
        description: 'Download official USB drivers for Android flashing and rooting',
        icon: siteIcons.usb,
    },
    {
        href: '/space/Flash-Tool',
        title: 'Flashing Tools',
        description: 'Professional tools for flashing, rooting, and unlocking devices',
        icon: siteIcons.tools,
    },
    {
        href: '/scpl',
        title: 'Spare Parts Price',
        description: 'Find genuine mobile parts and authorized service centers near you',
        icon: siteIcons.rupee,
    },
]
