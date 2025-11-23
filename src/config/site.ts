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
    isDev: process.env.NODE_ENV === 'development',
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
    dark: '#000000',
}

export const fallback = {
    order: 'https://cdn3d.iconscout.com/3d/premium/thumb/packages-3d-icon-png-download-5299181.png',
    brand: 'https://cdn3d.iconscout.com/3d/premium/thumb/astronaut-riding-rocket-while-waiving-hand-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--hello-logo-gesture-pack-aerospace-illustrations-4431886.png',
    brandSearch: '/fallback/categorySearch.png',
    category: '/fallback/category.png',
    categorySearch: '/fallback/categorySearch.png',
}

export type Fallback = typeof fallback

export const storage = [
    { name: '128MB + 256MB' },
    { name: '256MB + 512MB' },
    { name: '512MB + 1GB' },
    { name: '512MB + 4GB' },
    { name: '1GB + 4GB' },
    { name: '1GB + 8GB' },
    { name: '1GB + 16GB' },
    { name: '2GB + 8GB' },
    { name: '2GB + 16GB' },
    { name: '2GB + 32GB' },
    { name: '3GB + 16GB' },
    { name: '3GB + 32GB' },
    { name: '4GB + 32GB' },
    { name: '4GB + 64GB' },
    { name: '4GB + 128GB' },
    { name: '6GB + 64GB' },
    { name: '6GB + 128GB' },
    { name: '8GB + 128GB' },
    { name: '8GB + 256GB' },
    { name: '8GB + 512GB' },
    { name: '12GB + 256GB' },
    { name: '12GB + 512GB' },
    { name: '16GB + 512GB' },
    { name: '16GB + 1TB' },
    { name: '24GB + 512GB' },
    { name: '24GB + 1TB' },
    { name: '32GB + 1TB' },
    { name: '32GB + 2TB' },
    { name: '64GB + 2TB' },
    { name: '64GB + 4TB' },
    { name: '128GB + 4TB' },
    { name: '128GB + 8TB' },
]

export type Storage = typeof storage
