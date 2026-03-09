'use client'

import { Download, Setup, Suggestion, OrdersIcon, TransactionsIcon } from '@/ui/icons'
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
        visible: (user: any) => !user,
    },
    {
        key: 'orders',
        title: 'Orders',
        icon: OrdersIcon,
        shouldFilter: false,
        visible: (user: any) => !!user,
    },
    {
        key: 'transactions',
        title: 'Transactions',
        icon: TransactionsIcon,
        shouldFilter: false,
        visible: (user: any) => !!user,
    },
    {
        key: 'downloads',
        title: 'Downloads',
        icon: Download,
        shouldFilter: true,
        visible: (user: any) => !user && useDownloadStore.getState().hasDownloads(),
    },
]

export const tabs = (user: any) => tabConfigs.filter((t) => t.visible(user))
