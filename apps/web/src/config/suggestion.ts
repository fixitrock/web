export const Suggestion = [
    {
        id: 'general',
        title: 'General',
        children: [
            {
                id: 'home',
                title: 'Return to Home',
                icon: 'simple-icons:ghostery',
                href: '/',
            },
            {
                id: 'theme',
                title: 'Change Theme . . .',
                icon: 'fa7-solid:brush',

                children: [
                    {
                        id: 'light',
                        title: 'Change Theme to Light',
                        icon: 'line-md:moon-to-sunny-outline-loop-transition',
                        action: { type: 'theme', value: 'light' },
                    },
                    {
                        id: 'system',
                        title: 'Change Theme to System',
                        icon: 'line-md:computer',
                        action: { type: 'theme', value: 'system' },
                    },
                    {
                        id: 'dark',
                        title: 'Change Theme to Dark',
                        icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
                        action: { type: 'theme', value: 'dark' },
                    },
                ],
            },
        ],
    },
    {
        id: 'help',
        title: 'Help',
        children: [
            {
                id: 'support',
                title: 'Contact Support',
                icon: 'bx:support',
                href: 'https://wa.me/919927241144',
            },
        ],
    },
]

export const Space = [
    {
        id: 'space-firmwares',
        title: 'Firmwares',
        description: 'Download official firmware files for all mobile devices and brands',
        icon: 'fluent:phone-link-setup-24-regular',
        href: '/space',
    },
    // {
    //     id: 'space-apps',
    //     title: 'Apps',
    //     description: 'Get the latest apps for Android, iOS, Windows, MacOS, and Linux',
    //     icon: 'ri:apps-2-ai-line',

    //     href: '/space/apps',
    // },
    // {
    //     id: 'space-games',
    //     title: 'Games',
    //     description: 'Download premium games for mobile, PC, and gaming consoles',
    //     icon: 'ion:game-controller',
    //     href: '/space/games',
    // },
    {
        id: 'space-frp',
        title: 'FRP Bypass',
        description: 'Remove Factory Reset Protection and unlock your Android device',
        icon: 'hugeicons:phone-lock',
        href: '/frp',
    },
    {
        id: 'space-icloud',
        title: 'iCloud Bypass',
        description: 'Unlock iCloud locked devices with our reliable bypass solutions',
        icon: 'mdi:apple',
        href: '/space/iCloud',
    },
    {
        id: 'space-drivers',
        title: 'USB Drivers',
        description: 'Download official USB drivers for Android flashing and rooting',
        icon: 'hugeicons:usb-connected-01',
        href: '/space/Drivers',
    },
    {
        id: 'space-flash-tool',
        title: 'Flashing Tools',
        description: 'Professional tools for flashing, rooting, and unlocking devices',
        icon: 'hugeicons:phone-arrow-up',
        href: '/space/Flash-Tool',
    },
    {
        id: 'space-spare-parts',
        title: 'Spare Parts Price',
        description: 'Find genuine mobile parts and authorized service centers near you',
        icon: 'mynaui:rupee-waves',
        href: '/scpl',
    },
]
