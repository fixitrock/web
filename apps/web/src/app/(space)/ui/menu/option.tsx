'use client'

import * as React from 'react'
import { Header, Kbd, Label, ListBox, Separator, toast } from '@heroui/react'
import { FolderSymlink } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { logWarning } from '@/lib/utils'
import { DriveItem } from '@/types/drive'
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
} from '@/ui/context-menu'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/ui/drawer'
import { Delete as DIcon, Link, NewTab, NewWindow, Rename as RIcon, Share } from '@/ui/icons'

export function Menu({
    c,
    open,
    setOpen,
    onSelected,
    userRole,
    onRename,
    onDelete,
}: {
    c: DriveItem
    open: boolean
    setOpen: (open: boolean) => void
    onSelected: (c: DriveItem) => void
    userRole?: number
    onRename?: (item: DriveItem) => void
    onDelete?: (item: DriveItem) => void
}) {
    const path = usePathname()
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const url = `${siteConfig.domain}${c.folder ? `${c.href}` : `${path}#${c.name}`}`
    const isAdmin = userRole === 3

    const handleCopy = () => {
        copy(url)
            .then(() => {
                toast.success('Copied!', {
                    description: `Hooray! The link to ${c.name} is copied!`,
                })
            })
            .catch(() => {
                toast.danger('Copy failed', {
                    description: `Oops! Couldn't copy the link. Give it another try!`,
                })
            })
    }

    const handleShare = () => share(url)

    const handleRename = () => {
        onRename?.(c)
        setOpen(false)
    }

    const handleDelete = () => {
        onDelete?.(c)
        setOpen(false)
    }

    const openInNewTab = () => window.open(url, '_blank')
    const openInNewWindow = () => {
        const width = window.innerWidth
        const height = window.innerHeight

        window.open(url, '_blank', `width=${width},height=${height}`)
    }

    const handleAction = (key: string) => {
        switch (key) {
            case 'copy':
                handleCopy()
                break
            case 'share':
                handleShare()
                break
            case 'rename':
                handleRename()
                return
            case 'delete':
                handleDelete()
                return
            case 'open':
                onSelected(c)
                break
            case 'open-in-new-tab':
                openInNewTab()
                break
            case 'open-in-new-window':
                openInNewWindow()
                break
        }

        setOpen(false)
    }

    return isDesktop ? (
        <ContextMenuContent key={open ? 'open' : 'closed'} className='w-[280px]'>
            <div className='flex items-center'>
                <ContextMenuItem className='w-full flex-col gap-1' onSelect={handleCopy}>
                    <Link className='size-6' /> Copy
                </ContextMenuItem>
                <ContextMenuItem className='w-full flex-col gap-1' onSelect={handleShare}>
                    <Share className='size-6' /> Share
                </ContextMenuItem>
                <ContextMenuItem
                    className='w-full flex-col gap-1'
                    disabled={!isAdmin}
                    onSelect={isAdmin ? handleRename : undefined}
                >
                    <RIcon className='size-6' /> Rename
                </ContextMenuItem>
                <ContextMenuItem
                    className='text-danger w-full flex-col gap-1'
                    disabled={!isAdmin}
                    onSelect={isAdmin ? handleDelete : undefined}
                >
                    <DIcon className='size-6' /> Delete
                </ContextMenuItem>
            </div>
            <ContextMenuSeparator />
            <ContextMenuItem className='gap-2' onSelect={() => onSelected(c)}>
                <FolderSymlink size={20} /> Open
                <ContextMenuShortcut>enter</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem className='gap-2' onSelect={openInNewTab}>
                <NewTab /> Open in new tab
            </ContextMenuItem>
            <ContextMenuItem className='gap-2' onSelect={openInNewWindow}>
                <NewWindow /> Open in new window
            </ContextMenuItem>
        </ContextMenuContent>
    ) : (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent className='bg-background/80 backdrop-blur'>
                <DrawerHeader className='sr-only'>
                    <DrawerTitle />
                    <DrawerDescription />
                </DrawerHeader>
                <ListBox
                    aria-label='Menu'
                    disabledKeys={isAdmin ? new Set() : new Set(['rename', 'delete'])}
                    onAction={(key) => handleAction(String(key))}
                >
                    <ListBox.Section>
                        <Header>Actions</Header>
                        <ListBox.Item id='copy' textValue='Copy'>
                            <Link />
                            <Label>Copy</Label>
                        </ListBox.Item>
                        <ListBox.Item id='share' textValue='Share'>
                            <Share />
                            <Label>Share</Label>
                        </ListBox.Item>
                        <ListBox.Item id='rename' textValue='Rename'>
                            <RIcon />
                            <Label>Rename</Label>
                        </ListBox.Item>
                        <ListBox.Item className='text-danger' id='delete' textValue='Delete'>
                            <DIcon />
                            <Label>Delete</Label>
                        </ListBox.Item>
                    </ListBox.Section>
                    <Separator />
                    <ListBox.Section>
                        <Header>Open</Header>
                        <ListBox.Item id='open' textValue='Open'>
                            <FolderSymlink size={20} />
                            <Label>Open</Label>
                            <Kbd className='ml-auto'>enter</Kbd>
                        </ListBox.Item>
                        <ListBox.Item id='open-in-new-tab' textValue='Open in new tab'>
                            <NewTab />
                            <Label>Open in new tab</Label>
                        </ListBox.Item>
                        <ListBox.Item id='open-in-new-window' textValue='Open in new window'>
                            <NewWindow />
                            <Label>Open in new window</Label>
                        </ListBox.Item>
                    </ListBox.Section>
                </ListBox>
            </DrawerContent>
        </Drawer>
    )
}

const share = async (url: string) => {
    try {
        if (url && navigator.share) {
            await navigator.share({ title: 'Check this out!', url })
        } else {
            alert('Sharing is not supported or URL is invalid.')
        }
    } catch (error) {
        logWarning('Error sharing:', error instanceof Error ? error.message : error)
    }
}

const copy = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject('Invalid URL to copy.')
        } else {
            navigator.clipboard
                .writeText(url)
                .then(() => resolve(url))
                .catch((error) => reject(error instanceof Error ? error.message : error))
        }
    })
}
