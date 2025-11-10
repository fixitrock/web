'use client'

import { Download, Setup, Suggestion } from '@/ui/icons'
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
        key: 'downloads',
        title: 'Downloads',
        icon: Download,
        shouldFilter: true,
        visible: () => useDownloadStore.getState().hasDownloads(),
    },
]
export const tabs = tabConfigs.filter((t) => t.visible())
