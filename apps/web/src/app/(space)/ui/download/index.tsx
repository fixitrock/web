'use client'

import { useState, useEffect } from 'react'
import { Badge, Button } from '@heroui/react'
import { ArrowDownToLine } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/ui/drawer'
import { useDownloadStore } from '@/zustand/store/download'
import { useDownloadWarning } from '@/hooks/useDownloadWarning'
import { useMediaQuery } from '@/hooks'

import { DownloadContent } from './content'

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

    if (totalDownloads === 0) {
        return null
    }

    if (!mounted) {
        return null
    }

    if (isDesktop) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Badge
                        isOneChar
                        className='size-3 min-h-0 min-w-0'
                        color='success'
                        isInvisible={!hasActiveDownloads}
                        shape='circle'
                        size='sm'
                    >
                        <Button
                            isIconOnly
                            aria-label={
                                hasActiveDownloads
                                    ? `${activeCount} active download${activeCount !== 1 ? 's' : ''} - Click to view download manager`
                                    : 'View download history - No active downloads'
                            }
                            className='bg-default/20'
                            content={activeCount.toString()}
                            radius='full'
                            size='sm'
                            startContent={<ArrowDownToLine size={18} />}
                            variant='light'
                            onPress={() => setIsOpen(true)}
                        />
                    </Badge>
                </PopoverTrigger>
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
            <DrawerTrigger asChild>
                <Badge
                    isOneChar
                    className='size-3 min-h-0 min-w-0'
                    color='success'
                    isInvisible={!hasActiveDownloads}
                    shape='circle'
                    size='sm'
                >
                    <Button
                        isIconOnly
                        aria-label={
                            hasActiveDownloads
                                ? `${activeCount} active download${activeCount !== 1 ? 's' : ''} - Click to view download manager`
                                : 'View download history - No active downloads'
                        }
                        className='bg-default/20'
                        content={activeCount.toString()}
                        radius='full'
                        size='sm'
                        startContent={<ArrowDownToLine size={18} />}
                        variant='light'
                        onPress={() => setIsOpen(true)}
                    />
                </Badge>
            </DrawerTrigger>
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
