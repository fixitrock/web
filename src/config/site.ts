import { Moon, Settings, SunIcon, User } from 'lucide-react'
import { BsUsbSymbol, BsApple } from 'react-icons/bs'
import { MdPhonelinkSetup } from 'react-icons/md'
import { RiComputerLine } from 'react-icons/ri'
import { TbApps, TbDeviceGamepad2 } from 'react-icons/tb'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
    title: 'Fix iT Rock',
    tagline: 'My tagline',
    description:
        'We Provide Mobile Firmwares Drivers Flash Tool FRP Dump FIle EMMC ISP PinOut Samsung MDM File Windows Files.',
    domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://fixitrock.com',
    baseDirectory: '/FixiTRock',
    cacheControlHeader: 'max-age=0, s-maxage=60, stale-while-revalidate',
    suggestion: [
        {
            href: '/Apps',
            title: 'Apps',
            description: 'Download apps for Android, MacOS, Windows, and Linux',
            icon: TbApps,
        },
        {
            href: '/Games',
            title: 'Games',
            description: 'Download games for Android, MacOS, Windows, and Linux',
            icon: TbDeviceGamepad2,
        },
        {
            href: '/frp',
            title: 'FRP Bypass Tools',
            description: 'Get FRP Bypass files and tools for your device',
            icon: TbApps,
        },
        {
            href: '/Drivers',
            title: 'USB Drivers',
            description: 'Download Android USB flashing drivers',
            icon: BsUsbSymbol,
        },
        {
            href: '/Flash-Tool',
            title: 'Flashing Tools',
            description: 'Tools for flashing mobile devices',
            icon: MdPhonelinkSetup,
        },
        {
            href: '/iCloud',
            title: 'iCloud Bypass Solutions',
            description: 'Say goodbye to iCloud locks: Unlock now.',
            icon: BsApple,
        },
    ],
    themes: [
        {
            title: 'Light',
            theme: 'light',
            description: 'Change Theme to Light',
            icon: SunIcon,
        },
        {
            title: 'System',
            theme: 'system',
            description: 'Change Theme to System',
            icon: RiComputerLine,
        },
        {
            title: 'Dark',
            theme: 'dark',
            description: 'Change Theme to Dark',
            icon: Moon,
        },
    ],
}

export type PageConfig = typeof pageConfig

export const pageConfig = {
    user: [
        {
            title: 'Profile',
            description: 'View and edit your profile',
            icon: '👤',
            link: '',
        },
        {
            title: 'Orders',
            description: 'View and manage your orders',
            icon: '🧾',
            link: '/orders',
        },

        {
            title: 'Settings',
            description: 'Manage your account settings',
            icon: '⚙️',
            link: '/settings',
        },
        {
            title: 'Help & Support',
            description: 'Get help and support',
            icon: '❓',
            link: '',
        },
        {
            title: 'Logout',
            description: 'Logout from your account',
            icon: '👋🏻',
            link: '',
        },
    ],
    admin: [
        {
            title: 'Dashboard',
            description: 'View and manage your dashboard',
            icon: User,
            link: '',
        },
        {
            title: 'Settings',
            description: 'Manage your account settings',
            icon: Settings,
            link: '/settings',
        },
    ],
}
export const META_THEME_COLORS = {
    light: '#ffffff',
    dark: '#00000',
}
