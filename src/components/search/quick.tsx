'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { useTheme } from 'next-themes'

import { Icon } from '@/lib'
import {
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
} from '@/ui/command'
import { useSearchStore } from '@/zustand/store'

import { Navigations } from './type'

export function QuickAction({ command }: { command: Record<string, Navigations> | null }) {
    const router = useRouter()
    const { setTheme } = useTheme()
    const { setDynamicNavigations, getNavigationGroups, onSelect } = useSearchStore()

    useEffect(() => {
        if (command) {
            const { ['Repair Tools']: _space, ...restActions } = actions
            setDynamicNavigations({
                ...command,
                Quick: shortcuts,
                ...restActions,
            })
        } else {
            setDynamicNavigations({ ...actions })
        }
    }, [command, setDynamicNavigations])

    const groups = getNavigationGroups()

    return (
        <>
            {groups.map((group, index) => (
                <React.Fragment key={group.heading}>
                    <CommandGroup heading={group.heading}>
                        {group.navigationItems?.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={`${item.title} ${item.description || ''} ${item.keywords?.join(' ') || ''}`}
                                onSelect={() => onSelect(item, router, setTheme)}
                            >
                                {item.icon && (
                                    <Icon base='size-6' className='size-6' icon={item.icon} />
                                )}
                                <div className='flex w-full flex-1 flex-col items-start truncate'>
                                    {item.title && (
                                        <div className='text-sm font-medium'>{item.title}</div>
                                    )}
                                </div>
                                {item.shortcut && (
                                    <CommandShortcut className='flex gap-1'>
                                        {item.shortcut?.map((s, i) => (
                                            <kbd
                                                key={i}
                                                className='bg-border rounded px-1.5 py-0.5 font-mono'
                                            >
                                                {s}
                                            </kbd>
                                        ))}
                                    </CommandShortcut>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    {index < groups.length - 1 && <CommandSeparator />}
                </React.Fragment>
            ))}
            <CommandEmpty>No Results Found</CommandEmpty>
        </>
    )
}

const shortcuts: Navigations = [
    {
        id: 'space-shortcut',
        title: 'Search Firmwares . . .',
        icon: 'fluent:phone-link-setup-24-regular',
        action: { type: 'tab', value: 'space' },
        keywords: ['search', 'firmware', 'phone', 'device', 'flash'],
    },
    {
        id: 'download-shortcut',
        title: 'Downloads & History',
        icon: 'hugeicons:download-01',
        action: { type: 'tab', value: 'downloads' },
        keywords: ['download', 'history', 'received', 'files'],
    },
]

const actions: Record<string, Navigations> = {
    'Repair Tools': [
        {
            id: 'space',
            title: 'Search Firmwares . . .',
            icon: 'fluent:phone-link-setup-24-regular',
            action: { type: 'tab', value: 'space' },
            keywords: ['search', 'firmware', 'phone', 'device', 'flash'],
        },
        {
            id: 'space-frp',
            title: 'FRP Bypass',
            icon: 'hugeicons:phone-lock',
            href: '/frp',
            keywords: ['frp', 'bypass', 'google', 'lock', 'android'],
        },
        {
            id: 'space-flash-tool',
            title: 'Flashing Tools',
            icon: 'hugeicons:phone-arrow-up',
            href: '/space/Flash-Tool',
            keywords: ['flash', 'tools', 'firmware', 'update', 'phone'],
        },
        {
            id: 'space-spare-parts',
            title: 'Spare Parts Price',
            description: 'Find genuine mobile parts and authorized service centers near you',
            icon: 'mynaui:rupee-waves',
            href: '/scpl',
            keywords: ['spare', 'parts', 'price', 'mobile', 'repair'],
        },
    ],
    general: [
        {
            id: 'home',
            title: 'Return to Home',
            icon: 'simple-icons:ghostery',
            href: '/',
            keywords: ['home', 'go back', 'main', 'start', 'homepage'],
        },
        {
            id: 'theme',
            title: 'Change Theme . . .',
            icon: 'fa7-solid:brush',
            action: { type: 'section', value: 'theme' },
            keywords: ['theme', 'appearance', 'light', 'dark', 'mode', 'color'],
            children: [
                {
                    id: 'light',
                    title: 'Change Theme to Light',
                    icon: 'line-md:moon-to-sunny-outline-loop-transition',
                    action: { type: 'theme', value: 'light' },
                    keywords: ['light', 'bright', 'day', 'theme', 'mode'],
                    shortcut: ['⌘', 'L'],
                },
                {
                    id: 'system',
                    title: 'Change Theme to System',
                    icon: 'line-md:computer',
                    action: { type: 'theme', value: 'system' },
                    keywords: ['system', 'auto', 'follow', 'device', 'theme'],
                    shortcut: ['⌘', 'S'],
                },
                {
                    id: 'dark',
                    title: 'Change Theme to Dark',
                    icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
                    action: { type: 'theme', value: 'dark' },
                    keywords: ['dark', 'night', 'theme', 'mode', 'black'],
                    shortcut: ['⌘', 'D'],
                },
            ],
        },
    ],
    Support: [
        {
            id: 'support',
            title: 'Contact Support',
            icon: 'bx:support',
            href: 'https://wa.me/919927241144',
            keywords: ['support', 'help', 'contact', 'whatsapp', 'customer'],
        },
    ],
}
