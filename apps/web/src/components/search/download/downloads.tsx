'use client'

import React from 'react'
import { Button, Progress } from '@heroui/react'
import { FaPlay, FaStop, FaTrash, FaPause } from 'react-icons/fa'

import { CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '@/ui/command'
import { formatBytes } from '@/lib/utils'
import { useDownloadWarning } from '@/hooks/useDownloadWarning'
import { DownloadItem, useDownloadStore } from '@/zustand/store'
import { useDownload } from '@/hooks/useDownload'
import { Thumbnail } from '@/ui'

function groupDownloadsByDate(downloads: DownloadItem[]) {
    const groups: Record<string, DownloadItem[]> = {}
    const todayStr = new Date().toDateString()

    for (const d of downloads) {
        const date = new Date(d.startTime || Date.now())
        const key =
            date.toDateString() === todayStr
                ? 'Today'
                : date.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  })

        if (!groups[key]) groups[key] = []
        groups[key].push(d)
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

        function formatTimeRemaining(sec: number) {
            if (sec < 60) return `${sec}s left`
            if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s left`

            return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m left`
        }
        function getSpeedText() {
            if (isCompleted || isPaused || isError || isCancelled) return '0 B/s'
            if (download.status === 'queued') return `Queue #${download.queuePosition || '?'}`
            if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'Starting...'

            return speed > 0 ? `${formatBytes(speed)}/s` : 'Calculating speed...'
        }
        function getStatusText() {
            if (isCancelled) return 'Cancelled'
            if (isError) return download.error || 'Error'
            if (isCompleted) return 'Completed'
            if (isPaused) return 'Paused'
            if (download.status === 'queued')
                return `Queue Position ${download.queuePosition || '?'}`
            if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'Starting...'
            if (speed === 0 && downloaded > 0) return 'Calculating speed...'

            return timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Downloading...'
        }
        function getProgressColor() {
            if (isCancelled || isError) return 'danger'
            if (isCompleted) return 'success'
            if (isPaused) return 'warning'
            if (download.status === 'queued') return 'secondary'
            if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'secondary'

            return 'primary'
        }

        return {
            downloaded,
            total,
            speed,
            isPaused,
            isCompleted,
            isError,
            isCancelled,
            progressPercentage,
            canResume,
            getSpeedText,
            getStatusText,
            getProgressColor,
        }
    }

    function getActions(download: DownloadItem, status: ReturnType<typeof getDownloadStatus>) {
        if (status.isCompleted) {
            return (
                <Button
                    isIconOnly
                    color='danger'
                    radius='full'
                    size='sm'
                    startContent={<FaTrash className='text-danger' size={14} />}
                    title='Remove from history'
                    variant='light'
                    onPress={() => removeDownload(download.id)}
                />
            )
        }
        if (status.isCancelled || status.isError) {
            return (
                <>
                    {status.canResume && (
                        <Button
                            isIconOnly
                            color='primary'
                            radius='full'
                            size='sm'
                            startContent={<FaPlay size={14} />}
                            title='Retry download'
                            variant='light'
                            onPress={() => resumeDownload(download)}
                        />
                    )}
                    <Button
                        isIconOnly
                        color='danger'
                        radius='full'
                        size='sm'
                        startContent={<FaTrash className='text-danger' size={14} />}
                        title='Remove from history'
                        variant='light'
                        onPress={() => removeDownload(download.id)}
                    />
                </>
            )
        }
        if (download.status === 'queued') {
            return (
                <Button
                    isIconOnly
                    radius='full'
                    size='sm'
                    startContent={<FaStop size={14} />}
                    title='Cancel download'
                    variant='light'
                    onPress={() => cancelDownload(download.id)}
                />
            )
        }
        if (status.isPaused) {
            return (
                <>
                    <Button
                        isIconOnly
                        radius='full'
                        size='sm'
                        startContent={<FaPlay size={14} />}
                        title='Resume'
                        variant='light'
                        onPress={() => resumeDownload(download)}
                    />
                    <Button
                        isIconOnly
                        radius='full'
                        size='sm'
                        startContent={<FaStop size={14} />}
                        title='Cancel download'
                        variant='light'
                        onPress={() => cancelDownload(download.id)}
                    />
                </>
            )
        }

        return (
            <>
                <Button
                    isIconOnly
                    radius='full'
                    size='sm'
                    startContent={<FaPause size={14} />}
                    title='Pause'
                    variant='light'
                    onPress={() => pauseDownload(download.id)}
                />
                <Button
                    isIconOnly
                    radius='full'
                    size='sm'
                    startContent={<FaStop size={14} />}
                    title='Cancel download'
                    variant='light'
                    onPress={() => cancelDownload(download.id)}
                />
            </>
        )
    }

    return (
        <>
            {sortedDateKeys.map((group, index) => (
                <React.Fragment key={group}>
                    <CommandGroup key={group} heading={group}>
                        {downloadsByDate[group]?.map((download) => {
                            const status = getDownloadStatus(download)

                            return (
                                <CommandItem key={download.id}>
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
                                                    <Progress
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
                                    <CommandShortcut>
                                        {getActions(download, status)}
                                    </CommandShortcut>
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                    {index < sortedDateKeys.length - 1 && <CommandSeparator />}
                </React.Fragment>
            ))}
        </>
    )
}
