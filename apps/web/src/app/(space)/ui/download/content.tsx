'use client '

import { Download } from 'lucide-react'

import { useDownload } from '@/hooks/useDownload'
import { useDownloadStore, DownloadItem } from '@/zustand/store/download'

import { DownloadHeader } from './header'
import { Status } from './status'

interface DownloadContentProps {
    totalDownloads: number
    activeDownloads: DownloadItem[]
    pausedDownloads: DownloadItem[]
    completedDownloads: DownloadItem[]
    queuedDownloads: DownloadItem[]
}

const groupDownloadsByDate = (downloads: DownloadItem[]) => {
    const groups: Record<string, DownloadItem[]> = {}

    downloads.forEach((download) => {
        const date = new Date(download.startTime || Date.now())
        const today = new Date()

        let dateKey: string

        if (date.toDateString() === today.toDateString()) {
            dateKey = 'Today'
        } else {
            dateKey = date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
        }

        if (!groups[dateKey]) {
            groups[dateKey] = []
        }
        groups[dateKey].push(download)
    })

    return groups
}

const sortDateKeys = (dateKeys: string[]) => {
    return dateKeys.sort((a, b) => {
        if (a === 'Today') return -1
        if (b === 'Today') return 1

        const dateA = new Date(a)
        const dateB = new Date(b)

        return dateB.getTime() - dateA.getTime()
    })
}

export function DownloadContent({
    totalDownloads,
    activeDownloads,
    pausedDownloads,
    completedDownloads,
    queuedDownloads,
}: DownloadContentProps) {
    const { clearCompleted, removeDownload } = useDownloadStore()
    const { pauseDownload, resumeDownload, cancelDownload } = useDownload()

    const handleClearCompleted = () => {
        clearCompleted()
    }

    const handleRemoveDownload = (id: string) => {
        removeDownload(id)
    }

    // Combine all downloads and group by date
    const allDownloads = [
        ...queuedDownloads,
        ...activeDownloads,
        ...pausedDownloads,
        ...completedDownloads,
    ]

    // Sort downloads by startTime (most recent first)
    const sortedDownloads = allDownloads.sort((a, b) => {
        const timeA = a.startTime || 0
        const timeB = b.startTime || 0

        return timeB - timeA // Most recent first
    })

    const downloadsByDate = groupDownloadsByDate(sortedDownloads)
    const sortedDateKeys = sortDateKeys(Object.keys(downloadsByDate))

    return (
        <>
            <DownloadHeader
                completedCount={completedDownloads.length}
                onClearCompleted={handleClearCompleted}
            />

            <div className='bg-background max-h-[60vh] overflow-y-auto p-2 md:max-h-[45vh]'>
                {totalDownloads === 0 ? (
                    <div className='text-muted-foreground py-12 text-center'>
                        <Download className='mx-auto mb-3 h-12 w-12' />
                        <p className='font-medium'>No downloads yet</p>
                        <p className='text-sm'>Start downloading files to see them here</p>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {sortedDateKeys.map((dateKey) => (
                            <div key={dateKey} className='space-y-2'>
                                <h3 className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                                    {dateKey}
                                </h3>
                                {downloadsByDate[dateKey]?.map((download) => (
                                    <Status
                                        key={download.id}
                                        download={download}
                                        onCancel={() => cancelDownload(download.id)}
                                        onPause={() => pauseDownload(download.id)}
                                        onRemove={() => handleRemoveDownload(download.id)}
                                        onResume={() => resumeDownload(download)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
