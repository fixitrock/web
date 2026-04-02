'use client'

import { Button, ProgressBar } from '@heroui/react'
import { FaPause, FaPlay, FaStop, FaTrash } from 'react-icons/fa'

import { formatBytes } from '@/lib/utils'
import { DownloadItem } from '@/zustand/store/download'

interface ActiveProps {
    download: DownloadItem
    onPause: () => void
    onResume?: () => void
    onCancel?: () => void
    onRemove?: () => void
}

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

const formatSpeed = (speed?: number) => {
    if (!speed) return '0 B/s'

    const mbps = speed / (1024 * 1024)

    if (mbps >= 1) {
        return `${mbps.toFixed(1)} MB/s`
    }

    if (mbps >= 0.001) {
        const kbps = speed / 1024

        return `${kbps.toFixed(1)} KB/s`
    }

    return `${speed.toFixed(0)} B/s`
}

const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s left`

    const minutes = Math.floor(seconds / 60)

    if (minutes < 60) return `${minutes}m left`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours < 24) return `${hours}h ${remainingMinutes}m left`

    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24

    return `${days}d ${remainingHours}h left`
}

export function Status({ download, onPause, onResume, onCancel, onRemove }: ActiveProps) {
    const downloaded = download.downloadedBytes || 0
    const total = download.size || 0
    const remaining = Math.max(0, total - downloaded)
    const speed = download.speed || 0
    const isPaused = download.status === 'paused'
    const isCompleted = download.status === 'completed'
    const isError = download.status === 'error'
    const isCancelled =
        download.error?.includes('cancelled') ||
        download.error?.includes('expired') ||
        download.error?.includes('network')

    const timeRemaining =
        !isPaused && !isCompleted && !isError && !isCancelled && speed > 0
            ? Math.ceil(remaining / speed)
            : 0

    const progressPercentage = total > 0 ? Math.round((downloaded / total) * 100) : 0

    const getProgressColor = () => {
        if (isCancelled || isError) return 'danger'
        if (isCompleted) return 'success'
        if (isPaused) return 'warning'
        if (download.status === 'queued') return 'default'
        if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'default'

        return 'accent'
    }

    const getStatusText = () => {
        if (isCancelled) return 'Cancelled'
        if (isError) return download.error || 'Error'
        if (isCompleted) return 'Completed'
        if (isPaused) return 'Paused'
        if (download.status === 'queued') return `Queue Position ${download.queuePosition || '?'}`
        if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'Starting...'
        if (speed === 0 && downloaded > 0) return 'Calculating speed...'

        return timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Downloading...'
    }

    const getSpeedText = () => {
        if (isCompleted || isPaused || isError || isCancelled) return '0 B/s'
        if (download.status === 'queued') return `Queue #${download.queuePosition || '?'}`
        if (progressPercentage === 0 && speed === 0 && downloaded === 0) return 'Starting...'

        return formatSpeed(speed)
    }

    const canResume = !isCompleted && !isCancelled && download.downloadUrl

    return (
        <div className='hover:bg-muted/40 flex flex-col rounded-2xl border p-3'>
            <div className='flex items-center justify-between'>
                <p className='truncate text-sm font-medium'>{download.name}</p>
                <div className='flex items-center space-x-1.5'>
                    {isCompleted && onRemove ? (
                        <ActionIconButton
                            icon={<FaTrash size={14} />}
                            label='Remove from history'
                            variant='danger-soft'
                            onPress={onRemove}
                        />
                    ) : isCancelled || isError ? (
                        <>
                            {canResume && onResume ? (
                                <ActionIconButton
                                    icon={<FaPlay size={14} />}
                                    label='Retry download'
                                    variant='tertiary'
                                    onPress={onResume}
                                />
                            ) : null}
                            {onRemove ? (
                                <ActionIconButton
                                    icon={<FaTrash size={14} />}
                                    label='Remove from history'
                                    variant='danger-soft'
                                    onPress={onRemove}
                                />
                            ) : null}
                        </>
                    ) : download.status === 'queued' ? (
                        onCancel ? (
                            <ActionIconButton
                                icon={<FaStop size={14} />}
                                label='Cancel download'
                                onPress={onCancel}
                            />
                        ) : null
                    ) : isPaused ? (
                        <>
                            {onResume ? (
                                <ActionIconButton
                                    icon={<FaPlay size={14} />}
                                    label='Resume'
                                    onPress={onResume}
                                />
                            ) : null}
                            {onCancel ? (
                                <ActionIconButton
                                    icon={<FaStop size={14} />}
                                    label='Cancel download'
                                    onPress={onCancel}
                                />
                            ) : null}
                        </>
                    ) : (
                        <>
                            <ActionIconButton
                                icon={<FaPause size={14} />}
                                label='Pause'
                                onPress={onPause}
                            />
                            {onCancel ? (
                                <ActionIconButton
                                    icon={<FaStop size={14} />}
                                    label='Cancel download'
                                    onPress={onCancel}
                                />
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            {!isCompleted && !isCancelled && !isError ? (
                <ProgressBar
                    aria-label={`${download.name} - ${progressPercentage}%`}
                    className='my-2 px-1'
                    color={getProgressColor()}
                    size='sm'
                    value={progressPercentage}
                />
            ) : null}

            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                {isCompleted ? (
                    <span>{formatBytes(total)}</span>
                ) : isCancelled || isError ? (
                    <span className='text-red-500'>
                        {isCancelled ? 'Download cancelled' : download.error || 'Download failed'}
                    </span>
                ) : download.status === 'queued' ? (
                    <span className='text-warning'>Queue {download.queuePosition || '?'}</span>
                ) : (
                    <div className='flex flex-1 items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <span>{getSpeedText()}</span>
                            <span>-</span>
                            <span>
                                {formatBytes(downloaded)} of {formatBytes(total)}
                            </span>
                            <span>-</span>
                            <span className={isPaused ? 'text-warning' : ''}>{getStatusText()}</span>
                        </div>
                        <span className='text-end'>{progressPercentage}%</span>
                    </div>
                )}
            </div>
        </div>
    )
}
