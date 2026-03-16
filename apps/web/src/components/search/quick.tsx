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
    const { query, setQuery, setDynamicNavigations, getNavigationGroups, onSelect } =
        useSearchStore()

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
                                value={item.id}
                                keywords={item.keywords}
                                onSelect={() => onSelect(item, router, setTheme)}
                            >
                                {item.icon && (
                                    <Icon base='size-6' className='size-6' icon={item.icon} />
                                )}
                                <div className='flex w-full flex-1 flex-col items-start truncate'>
                                    {item.title && (
                                        <div className='text-sm font-medium'>
                                            {item.title}
                                            {item.status && (
                                                <span className='text-muted-foreground ml-1 font-normal'>
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
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
            <CommandEmpty>
                <div className='flex flex-col items-center justify-center p-6 text-center'>
                    <div className='bg-default/10 mb-3 rounded-full border p-2.5'>
                        <Icon base='size-5' className='size-5' icon='hugeicons:search-remove' />
                    </div>
                    <h3 className='text-sm font-semibold'>No matching command</h3>
                    <p className='text-muted-foreground mt-1 max-w-64 text-xs'>
                        Try a shorter keyword or use one of these suggestions.
                    </p>

                    <div className='mt-3 flex flex-wrap justify-center gap-1.5'>
                        {['firmware', 'downloads', 'theme', 'support'].map((term) => (
                            <button
                                key={term}
                                type='button'
                                onClick={() => setQuery(term)}
                                className='bg-default/8 hover:bg-default/15 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors'
                            >
                                {term}
                            </button>
                        ))}
                    </div>

                    {query.trim().length > 0 && (
                        <button
                            type='button'
                            onClick={() => setQuery('')}
                            className='text-primary mt-3 text-xs font-medium underline-offset-2 hover:underline'
                        >
                            Clear search
                        </button>
                    )}
                </div>
            </CommandEmpty>
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
        id: 'space-apps',
        title: 'Browse Apps . . .',
        icon: 'uim:apps',
        href: '/space/apps',
    },
    {
        id: 'space-games',
        title: 'Browse Games . . .',
        icon: 'f7:gamecontroller-alt-fill',
        href: '/space/games',
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
            id: 'space-apps',
            title: 'Browse Apps . . .',
            icon: 'uim:apps',
            href: '/space/apps',
        },
        {
            id: 'space-games',
            title: 'Browse Games . . .',
            icon: 'f7:gamecontroller-alt-fill',
            href: '/space/games',
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
            id: 'docs',
            title: 'Docs',
            status: '(Beta)',
            icon: 'hugeicons:book-open-01',
            href: 'https://docs.fixitrock.com',
            keywords: ['docs', 'documentation', 'guide', 'manual', 'help center'],
        },
        {
            id: 'support',
            title: 'Contact Support',
            icon: 'bx:support',
            href: 'https://wa.me/919927241144',
            keywords: ['support', 'help', 'contact', 'whatsapp', 'customer'],
        },
    ],
}
