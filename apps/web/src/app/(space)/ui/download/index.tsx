'use client'

import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowDownToLine } from 'lucide-react'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/ui/drawer'
import { useMediaQuery } from '@/hooks'
import { useDownloadWarning } from '@/hooks/useDownloadWarning'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { useDownloadStore } from '@/zustand/store/download'

import { DownloadContent } from './content'

function DownloadTrigger({
    activeCount,
    hasActiveDownloads,
    onPress,
}: {
    activeCount: number
    hasActiveDownloads: boolean
    onPress: () => void
}) {
    return (
        <div className='relative'>
            <Button
                isIconOnly
                aria-label={
                    hasActiveDownloads
                        ? `${activeCount} active download${activeCount !== 1 ? 's' : ''} - Click to view download manager`
                        : 'View download history - No active downloads'
                }
                className='bg-default/20 rounded-full'
                size='sm'
                variant='ghost'
                onPress={onPress}
            >
                <ArrowDownToLine size={18} />
            </Button>
            {hasActiveDownloads ? (
                <span className='bg-success absolute top-0 right-0 size-3 rounded-full border border-background' />
            ) : null}
        </div>
    )
}

export function Download() {
    useDownloadWarning()
    const { getActiveDownloads, getPausedDownloads, getCompletedDownloads, getQueuedDownloads } =
        useDownloadStore()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault()
                    setIsOpen(true)
                }
                if (event.key === 'Escape') {
                    setIsOpen(false)
                }
            }

            document.addEventListener('keydown', handleKeyDown)

            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }
    }, [])

    const activeDownloads = getActiveDownloads()
    const pausedDownloads = getPausedDownloads()
    const completedDownloads = getCompletedDownloads()
    const queuedDownloads = getQueuedDownloads()
    const totalDownloads =
        queuedDownloads.length +
        activeDownloads.length +
        pausedDownloads.length +
        completedDownloads.length

    const hasActiveDownloads =
        queuedDownloads.length > 0 || activeDownloads.length > 0 || pausedDownloads.length > 0
    const activeCount = queuedDownloads.length + activeDownloads.length + pausedDownloads.length

    if (totalDownloads === 0 || !mounted) {
        return null
    }

    const trigger = (
        <DownloadTrigger
            activeCount={activeCount}
            hasActiveDownloads={hasActiveDownloads}
            onPress={() => setIsOpen(true)}
        />
    )

    if (isDesktop) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                <PopoverContent
                    align='end'
                    className='w-[420px] overflow-hidden p-0'
                    sideOffset={10}
                >
                    <DownloadContent
                        activeDownloads={activeDownloads}
                        completedDownloads={completedDownloads}
                        pausedDownloads={pausedDownloads}
                        queuedDownloads={queuedDownloads}
                        totalDownloads={totalDownloads}
                    />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader hidden>
                    <DrawerTitle hidden />
                </DrawerHeader>
                <DownloadContent
                    activeDownloads={activeDownloads}
                    completedDownloads={completedDownloads}
                    pausedDownloads={pausedDownloads}
                    queuedDownloads={queuedDownloads}
                    totalDownloads={totalDownloads}
                />
            </DrawerContent>
        </Drawer>
    )
}
