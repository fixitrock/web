'use client'

import React from 'react'
import { Button, ProgressBar } from '@heroui/react'
import { FaPause, FaPlay, FaStop, FaTrash } from 'react-icons/fa'

import { useDownloadWarning } from '@/hooks/useDownloadWarning'
import { useDownload } from '@/hooks/useDownload'
import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '@/ui/command'
import { formatBytes } from '@/lib/utils'
import { Thumbnail } from '@/ui'
import { DownloadItem, useDownloadStore } from '@/zustand/store'

function ActionIconButton({
    icon,
    label,
    onPress,
    variant = 'ghost',
}: {
    icon: React.ReactNode
    label: string
    onPress: () => void
    variant?: 'ghost' | 'danger-soft' | 'tertiary'
}) {
    return (
        <Button
            isIconOnly
            aria-label={label}
            className='rounded-full'
            size='sm'
            variant={variant}
            onPress={onPress}
        >
            {icon}
        </Button>
    )
}

function groupDownloadsByDate(downloads: DownloadItem[]) {
    const groups: Record<string, DownloadItem[]> = {}
    const todayStr = new Date().toDateString()

    for (const download of downloads) {
        const date = new Date(download.startTime || Date.now())
        const key =
            date.toDateString() === todayStr
                ? 'Today'
                : date.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  })

        if (!groups[key]) groups[key] = []
        groups[key].push(download)
    }

    return groups
}

function sortDateKeys(dateKeys: string[]) {
    return dateKeys.sort((a, b) => {
        if (a === 'Today') return -1
        if (b === 'Today') return 1

        return new Date(b).getTime() - new Date(a).getTime()
    })
}

export function Downloads() {
    useDownloadWarning()
    const {
        getActiveDownloads,
        getPausedDownloads,
        getCompletedDownloads,
        getQueuedDownloads,
        removeDownload,
    } = useDownloadStore()
    const { pauseDownload, resumeDownload, cancelDownload } = useDownload()

    const allDownloads = [
        ...getQueuedDownloads(),
        ...getActiveDownloads(),
        ...getPausedDownloads(),
        ...getCompletedDownloads(),
    ].sort((a, b) => (b.startTime || 0) - (a.startTime || 0))

    const downloadsByDate = groupDownloadsByDate(allDownloads)
    const sortedDateKeys = sortDateKeys(Object.keys(downloadsByDate))

    function getDownloadStatus(download: DownloadItem) {
        const downloaded = download.downloadedBytes || 0
        const total = download.size || 0
        const speed = download.speed || 0
        const isPaused = download.status === 'paused'
        const isCompleted = download.status === 'completed'
        const isError = download.status === 'error'
        const isCancelled =
            download.error?.includes('cancelled') ||
            download.error?.includes('expired') ||
            download.error?.includes('network')
        const progressPercentage = total > 0 ? Math.round((downloaded / total) * 100) : 0
        const canResume = !isCompleted && !isCancelled && download.downloadUrl
        const remaining = Math.max(0, total - downloaded)
        const timeRemaining =
            !isPaused && !isCompleted && !isError && !isCancelled && speed > 0
                ? Math.ceil(remaining / speed)
                : 0

        function formatTimeRemaining(seconds: number) {
            if (seconds < 60) return `${seconds}s left`
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s left`

            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m left`
        }

        function getSpeedText() {
            if (isCompleted || isPaused || isError || isCancelled) return '0 B/s'
            if (download.status === 'queued') return `Queue #${download.queuePosition || '?'}`
            if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'Starting...'

            return speed > 0 ? `${formatBytes(speed)}/s` : 'Calculating speed...'
        }

        function getProgressColor() {
            if (isCancelled || isError) return 'danger'
            if (isCompleted) return 'success'
            if (isPaused) return 'warning'
            if (download.status === 'queued') return 'default'
            if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'default'

            return 'accent'
        }

        return {
            downloaded,
            total,
            isCompleted,
            isError,
            isCancelled,
            progressPercentage,
            canResume,
            getSpeedText,
            getProgressColor,
            statusText:
                isCancelled
                    ? 'Cancelled'
                    : isError
                      ? download.error || 'Error'
                      : isCompleted
                        ? 'Completed'
                        : isPaused
                          ? 'Paused'
                          : download.status === 'queued'
                            ? `Queue Position ${download.queuePosition || '?'}`
                            : progressPercentage === 0 && speed === 0 && downloaded === 0
                              ? 'Starting...'
                              : speed === 0 && downloaded > 0
                                ? 'Calculating speed...'
                                : timeRemaining > 0
                                  ? formatTimeRemaining(timeRemaining)
                                  : 'Downloading...',
        }
    }

    function getActions(download: DownloadItem, status: ReturnType<typeof getDownloadStatus>) {
        if (status.isCompleted) {
            return (
                <ActionIconButton
                    icon={<FaTrash className='text-danger' size={14} />}
                    label='Remove from history'
                    variant='danger-soft'
                    onPress={() => removeDownload(download.id)}
                />
            )
        }

        if (status.isCancelled || status.isError) {
            return (
                <>
                    {status.canResume ? (
                        <ActionIconButton
                            icon={<FaPlay size={14} />}
                            label='Retry download'
                            variant='tertiary'
                            onPress={() => resumeDownload(download)}
                        />
                    ) : null}
                    <ActionIconButton
                        icon={<FaTrash className='text-danger' size={14} />}
                        label='Remove from history'
                        variant='danger-soft'
                        onPress={() => removeDownload(download.id)}
                    />
                </>
            )
        }

        if (download.status === 'queued') {
            return (
                <ActionIconButton
                    icon={<FaStop size={14} />}
                    label='Cancel download'
                    onPress={() => cancelDownload(download.id)}
                />
            )
        }

        if (download.status === 'paused') {
            return (
                <>
                    <ActionIconButton
                        icon={<FaPlay size={14} />}
                        label='Resume'
                        onPress={() => resumeDownload(download)}
                    />
                    <ActionIconButton
                        icon={<FaStop size={14} />}
                        label='Cancel download'
                        onPress={() => cancelDownload(download.id)}
                    />
                </>
            )
        }

        return (
            <>
                <ActionIconButton
                    icon={<FaPause size={14} />}
                    label='Pause'
                    onPress={() => pauseDownload(download.id)}
                />
                <ActionIconButton
                    icon={<FaStop size={14} />}
                    label='Cancel download'
                    onPress={() => cancelDownload(download.id)}
                />
            </>
        )
    }

    return (
        <>
            {sortedDateKeys.map((group, index) => (
                <React.Fragment key={group}>
                    <CommandGroup heading={group}>
                        {downloadsByDate[group]?.map((download) => {
                            const status = getDownloadStatus(download)

                            return (
                                <CommandItem key={download.id} value={download.name}>
                                    <Thumbnail name={download.name} type='List' />
                                    <div className='flex w-full flex-1 flex-col items-start gap-0 truncate'>
                                        <h3 className='truncate text-sm font-medium'>
                                            {download.name}
                                        </h3>
                                        <div className='text-muted-foreground flex w-full items-center gap-0.5 text-[10px] sm:gap-2 sm:text-xs'>
                                            {status.isCompleted ? (
                                                <span>{formatBytes(status.total)}</span>
                                            ) : status.isCancelled || status.isError ? (
                                                <span className='text-red-500'>
                                                    {status.isCancelled
                                                        ? 'Download cancelled'
                                                        : download.error || 'Download failed'}
                                                </span>
                                            ) : download.status === 'queued' ? (
                                                <span className='text-warning'>
                                                    Queue {download.queuePosition || '?'}
                                                </span>
                                            ) : (
                                                <div className='flex w-full flex-col'>
                                                    <ProgressBar
                                                        aria-label={`${download.name} - ${status.progressPercentage}%`}
                                                        className='my-0.5'
                                                        color={status.getProgressColor()}
                                                        size='sm'
                                                        value={status.progressPercentage}
                                                    />
                                                    <div className='flex flex-1 items-center justify-between'>
                                                        <div className='flex items-center gap-2'>
                                                            <span>{status.getSpeedText()}</span>
                                                            <span>-</span>
                                                            <span>
                                                                {formatBytes(status.downloaded)} of{' '}
                                                                {formatBytes(status.total)}
                                                            </span>
                                                        </div>
                                                        <span className='text-end'>
                                                            {status.progressPercentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <CommandShortcut>{getActions(download, status)}</CommandShortcut>
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                    {index < sortedDateKeys.length - 1 ? <CommandSeparator /> : null}
                </React.Fragment>
            ))}
        </>
    )
}
