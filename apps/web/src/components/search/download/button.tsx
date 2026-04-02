'use client'

import { Button } from '@heroui/react'
import { ArrowDownToLine } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useDownloadWarning } from '@/hooks/useDownloadWarning'
import { useDownloadStore, useSearchStore } from '@/zustand/store'

export function Download() {
    useDownloadWarning()
    const { badge, hasDownloads } = useDownloadStore()
    const { onOpen, isOpen, onClose, setTab } = useSearchStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (!hasDownloads()) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'j' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                setTab('downloads')
                if (!isOpen) onOpen()
            }
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [hasDownloads, isOpen, onClose, onOpen, setTab])

    if (!mounted || !hasDownloads()) {
        return null
    }

    return (
        <div className='relative'>
            <Button
                isIconOnly
                className='bg-default/20 rounded-full'
                size='sm'
                variant='ghost'
                onPress={() => {
                    setTab('downloads')
                    if (!isOpen) onOpen()
                }}
            >
                <ArrowDownToLine size={18} />
            </Button>
            {badge() ? (
                <span className='bg-success absolute top-0 right-0 size-3 rounded-full border border-background' />
            ) : null}
        </div>
    )
}
