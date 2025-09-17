import { Moon, SunIcon } from 'lucide-react'
import { BsUsbSymbol, BsApple, BsCode } from 'react-icons/bs'
import { FaRupeeSign, FaUnlock } from 'react-icons/fa'
import { MdPhonelinkSetup } from 'react-icons/md'
import { RiComputerLine } from 'react-icons/ri'
import { SiGhostery } from 'react-icons/si'
import { GiAutoRepair } from 'react-icons/gi'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
    title: 'Fix iT Rock',
    tagline: 'My tagline',
    description:
        'We Provide Mobile Firmwares Drivers Flash Tool FRP Dump FIle EMMC ISP PinOut Samsung MDM File Windows Files.',
    domain: process.env.NEXT_PUBLIC_SITE_URL || 'https://fixitrock.com',
    baseDirectory: 'Space',
    directoryUrl: '/space',
    redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixitrock.com'}/oauth`,
    cacheControlHeader: 'max-age=0, s-maxage=60, stale-while-revalidate',
    suggestion: [
        {
            href: '/',
            title: 'Home',
            description: 'Go to the main page',
            icon: SiGhostery,
        },
        {
            href: '/space',
            title: 'Space',
            description: 'Download official firmware files for all mobile devices and brands',
            icon: GiAutoRepair,
        },
        // {
        //     href: '/space/apps',
        //     title: 'Apps',
        //     description: 'Get the latest apps for Android, iOS, Windows, MacOS, and Linux',
        //     icon: TbApps,
        // },
        // {
        //     href: '/space/games',
        //     title: 'Games',
        //     description: 'Download premium games for mobile, PC, and gaming consoles',
        //     icon: TbDeviceGamepad2,
        // },
        {
            href: '/frp',
            title: 'FRP Bypass',
            description: 'Remove Factory Reset Protection and unlock your Android device',
            icon: FaUnlock,
        },
        {
            href: '/space/iCloud',
            title: 'iCloud Bypass',
            description: 'Unlock iCloud locked devices with our reliable bypass solutions',
            icon: BsApple,
        },
        {
            href: '/space/Drivers',
            title: 'USB Drivers',
            description: 'Download official USB drivers for Android flashing and rooting',
            icon: BsUsbSymbol,
        },
        {
            href: '/space/Flash-Tool',
            title: 'Flashing Tools',
            description: 'Professional tools for flashing, rooting, and unlocking devices',
            icon: MdPhonelinkSetup,
        },
        {
            href: '/scpl',
            title: 'Spare Parts Price',
            description: 'Find genuine mobile parts and authorized service centers near you',
            icon: FaRupeeSign,
        },
        {
            href: '/changelog',
            title: 'Changelog',
            description: 'Track all changes, new features, and improvements made to Fix iT Rock',
            icon: BsCode,
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

export const META_THEME_COLORS = {
    light: '#ffffff',
    dark: '#00000',
}
