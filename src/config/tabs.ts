'use client'

import { User } from '@/types/users'
import { Download, Setup, Suggestion, OrdersIcon } from '@/ui/icons'
import { useDownloadStore } from '@/zustand/store'

export const tabConfigs = [
    {
        key: 'actions',
        title: 'Shortcuts',
        icon: Suggestion,
        shouldFilter: true,
        visible: () => true,
    },
    {
        key: 'space',
        title: 'Space',
        icon: Setup,
        shouldFilter: false,
        visible: () => true,
    },
    {
        key: 'orders',
        title: 'Orders',
        icon: OrdersIcon,
        shouldFilter: false,
        visible: (user: User) => user !== null,
    },
    {
        key: 'downloads',
        title: 'Downloads',
        icon: Download,
        shouldFilter: true,
        visible: () => useDownloadStore.getState().hasDownloads(),
    },
]
export const tabs = (user: any) => tabConfigs.filter((t) => t.visible(user))
