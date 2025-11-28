'use client'

import React from 'react'
import { Skeleton } from '@heroui/react'
import { useRouter } from 'nextjs-toploader/app'

import { CommandEmpty, CommandGroup, CommandItem } from '@/ui/command'
import { useSearch } from '@/hooks/tanstack/query'
import { SearchItem } from '@/types/drive'
import { formatBytes, formatDateTime, path } from '@/lib/utils'
import { Thumbnail } from '@/ui'
import { Icon } from '@/lib'
import { useSearchStore } from '@/zustand/store'

export function Space() {
    const { query, onSelect, setOpen } = useSearchStore()
    const router = useRouter()
    const { data, isLoading, debouncedQuery } = useSearch(query)

    const items = data?.value ?? []
    const isPendingSearch = query && query !== debouncedQuery

    if (!query) {
        return (
            <CommandGroup heading='⚡&nbsp;&nbsp;Quick Access in Space'>
                {Spaces.map((item) => (
                    <CommandItem key={item.id} onSelect={() => onSelect(item, router)}>
                        <Icon base='size-6' className='size-6' icon={item.icon} />
                        <div className='flex w-full flex-1 flex-col items-start truncate'>
                            {item.title && <div className='text-sm font-medium'>{item.title}</div>}
                            {item.description && (
                                <p className='text-muted-foreground text-xs'>{item.description}</p>
                            )}
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        )
    }

    if (isLoading || isPendingSearch) {
        return <Loading />
    }
    if (!isLoading && items.length === 0) {
        return <CommandEmpty>No result found</CommandEmpty>
    }

    return (
        <CommandGroup heading='🔍&nbsp;&nbsp;Results in Space'>
            {items.map((c: SearchItem) => (
                <CommandItem
                    key={c.id}
                    onSelect={() => {
                        router.push(path(c.webUrl, !!c.file))
                        setOpen(false)
                    }}
                >
                    <Thumbnail name={c.name} type='List' />
                    <div className='flex w-full flex-1 flex-col items-start truncate'>
                        <div className='text-sm font-medium'>{c.name}</div>
                        <p className='text-muted-foreground items-center text-xs'>
                            {[
                                c?.file && c?.size && formatBytes(c.size),
                                c?.lastModifiedDateTime && formatDateTime(c.lastModifiedDateTime),
                            ]
                                .filter(Boolean)
                                .map((item, index, arr) => (
                                    <span key={index}>
                                        {item}
                                        {index < arr.length - 1 && <span className='mx-2'>•</span>}
                                    </span>
                                ))}
                        </p>
                    </div>
                </CommandItem>
            ))}
        </CommandGroup>
    )
}

const Spaces = [
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
        keywords: ['spare', 'parts', 'price', 'mobile', 'repair'],
    },
]

const Loading = () => {
    const meta = [
        { id: 1, title: 'sm:max-w-sm' },
        { id: 2, title: 'sm:max-w-md' },
        { id: 3, title: 'sm:max-w-lg' },
        { id: 4, title: 'sm:max-w-md' },
        { id: 5, title: 'sm:max-w-lg' },
        { id: 6, title: 'sm:max-w-md' },
        { id: 7, title: 'sm:max-w-lg' },
        { id: 8, title: 'sm:max-w-sm' },
    ]

    return (
        <CommandGroup heading='🔎&nbsp;&nbsp;Searching in Space...'>
            {meta.map((l) => (
                <CommandItem key={l.id} value={l.title + Math.random()}>
                    {/* Icon/thumbnail placeholder */}
                    <Skeleton className='h-8 w-8 shrink-0 rounded-sm border' />

                    {/* Text area placeholder */}
                    <div className='flex grow flex-col items-start gap-y-1 truncate'>
                        {/* Title placeholder */}
                        <Skeleton className={`h-4 w-32 rounded ${l.title}`} />

                        {/* Meta row placeholder */}
                        <span className='text-muted-foreground flex items-center gap-2 text-xs'>
                            <Skeleton className='h-3 w-20 rounded' />
                            <span>•</span>
                            <Skeleton className='h-3 w-24 rounded' />
                        </span>
                    </div>
                </CommandItem>
            ))}
        </CommandGroup>
    )
}
