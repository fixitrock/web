import { DownloadItem } from '@/zustand/store/download'

const DOWNLOAD_STATUS_CONFIG = {
    downloading: {
        background: 'bg-blue-500/15 dark:bg-blue-400/20',
    },
    paused: {
        background: 'bg-amber-500/15 dark:bg-amber-400/20',
    },
    queued: {
        background: 'bg-slate-500/15 dark:bg-slate-400/20',
    },
    completed: {
        background: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    },
    error: {
        background: 'bg-rose-500/15 dark:bg-rose-400/20',
    },
} as const

type DownloadStatus = keyof typeof DOWNLOAD_STATUS_CONFIG

export const getDownloadBackground = (download: DownloadItem | undefined): string => {
    if (!download) return ''

    const status = download.status as DownloadStatus
    const config = DOWNLOAD_STATUS_CONFIG[status]

    if (!config || !config.background) return ''

    if (
        status === 'downloading' ||
        status === 'paused' ||
        status === 'queued' ||
        status === 'completed' ||
        status === 'error'
    ) {
        return `absolute inset-0 ${config.background} transition-all duration-300 ease-out`
    }

    return ''
}
