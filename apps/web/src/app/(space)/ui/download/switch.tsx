'use client'

import { CircleCheckBig, CloudDownload } from 'lucide-react'
import { IoPauseCircle, IoPlay, IoRefresh } from 'react-icons/io5'

import { DownloadItem } from '@/zustand/store/download'
import { DriveItem } from '@/types/drive'

interface DownloadSwitchProps {
    c: DriveItem
    downloads: Map<string, DownloadItem>
    size?: number
}

export function DownloadSwitch({ c, downloads, size = 16 }: DownloadSwitchProps) {
    const download = downloads.get(c.id)

    const getSwitchProps = () => {
        if (!download) {
            return {
                icon: <CloudDownload size={size} />,
                title: 'Click file to download',
            }
        }

        switch (download.status) {
            case 'queued':
                return {
                    title: `Queued - Position ${download.queuePosition || '?'}`,
                    isLoading: true,
                    borderColor: 'border-slate-500/15 dark:border-slate-400/20',
                }
            case 'downloading':
                return {
                    icon: (
                        <IoPauseCircle className='text-blue-500 dark:text-blue-400' size={size} />
                    ),
                    title: 'Downloading - Click file to pause',
                    borderColor: 'border-blue-500/15 dark:border-blue-400/20',
                }
            case 'paused':
                return {
                    icon: <IoPlay className='text-amber-500 dark:text-amber-400' size={size} />,
                    title: 'Paused - Click file to resume',
                    borderColor: 'border-amber-500/15 dark:border-amber-400/20',
                }
            case 'completed':
                return {
                    icon: (
                        <CircleCheckBig
                            className='text-emerald-500 dark:text-emerald-400'
                            size={size}
                        />
                    ),
                    title: 'Completed - Click file to download again',
                    color: 'success' as const,
                    borderColor: 'border-emerald-500/15 dark:border-emerald-400/20',
                }
            case 'error':
                return {
                    icon: <IoRefresh className='text-rose-500 dark:text-rose-400' size={size} />,
                    title: 'Error - Click file to retry',
                    color: 'danger' as const,
                    borderColor: 'border-rose-500/15 dark:border-rose-400/20',
                }
            default:
                return {
                    icon: <CloudDownload size={size} />,
                    title: 'Click file to download',
                }
        }
    }

    return getSwitchProps()
}
