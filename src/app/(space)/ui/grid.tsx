'use client'

import { Button, Card, CardFooter, CardHeader } from '@heroui/react'
import React from 'react'
import Link from 'next/link'
import { FaEye, FaFolder } from 'react-icons/fa'

import { BlogCardAnimation, fromLeftVariant } from '@/lib/FramerMotionVariants'
import { formatBytes, formatDateTime, getDownloadBackground } from '@/lib/utils'
import { Drive, DriveItem } from '@/types/drive'
import { ContextMenu, ContextMenuTrigger } from '@/ui/context-menu'
import AnimatedDiv from '@/ui/farmer/div'
import { MagicCard } from '@/ui/magiccard'
import { GridSkeleton } from '@/ui/skeleton'
import { Thumbnail } from '@/ui'
import { Menu } from '@/app/(space)/ui'
import { useKeyboardNavigation } from '@/hooks'
import { useDownloadStore } from '@/zustand/store'
import { useChild } from '@/zustand/store'

import { useSelectItem, useMenuManager } from '../hooks'
import { getHref } from '../utils'

import { DownloadSwitch } from './download/switch'

export function Grid({
    data,
    loadMore,
    focus,
    userRole,
}: {
    data?: Drive
    isLoading?: boolean
    loadMore?: boolean
    focus?: DriveItem | null
    userRole?: number
}) {
    const [active, setActive] = React.useState<DriveItem | null>(null)
    const [open, setOpen] = React.useState(false)
    const onSelect = useSelectItem(setActive, setOpen)
    const { downloads } = useDownloadStore()
    const { isFolder, isPreviewable, isDownloadable } = useChild()
    const { handleRename, handleDelete, menuManager } = useMenuManager()
    const { selectedIndex, listRef, getItemRef } = useKeyboardNavigation({
        length: data?.value.length ?? 0,
        mode: 'grid',
        onSelect: (index) => {
            const c = data?.value?.[index]

            if (c) onSelect(c)
        },
    })

    return (
        <div ref={listRef} className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4'>
            {data?.value.map((c, index) => {
                const isFolderOrPreviewable = isFolder(c) || isPreviewable(c)
                const href = isFolderOrPreviewable ? getHref(c) : undefined
                const cardProps = href ? { as: Link, href } : {}
                const bg = getDownloadBackground(downloads.get(c.id))
                const progress = downloads.get(c.id)?.progress || 0
                const download = isDownloadable(c)
                    ? DownloadSwitch({
                          c: c,
                          downloads,
                      })
                    : null

                return (
                    <ContextMenu
                        key={c.id}
                        onOpenChange={(open) => {
                            setOpen(open)
                            if (open) {
                                setActive(c)
                            } else {
                                setActive(null)
                            }
                        }}
                    >
                        <ContextMenuTrigger onClick={() => onSelect(c)}>
                            <AnimatedDiv
                                ref={getItemRef(index)}
                                className='h-full w-full'
                                mobileVariants={BlogCardAnimation}
                                variants={fromLeftVariant}
                            >
                                <Card
                                    aria-label={c?.name}
                                    className={`h-full w-full rounded-xl border bg-transparent transition-all duration-200 select-none hover:scale-[1.02] hover:shadow-lg ${
                                        selectedIndex === index
                                            ? 'border-purple-400/60 bg-purple-50/30 ring-1 ring-purple-400/30 dark:border-purple-400/50 dark:bg-purple-950/20'
                                            : focus?.name === c.name
                                              ? 'border-indigo-400/40 bg-indigo-50/20 ring-1 ring-indigo-400/20 dark:border-indigo-400/30 dark:bg-indigo-950/15'
                                              : ''
                                    }`}
                                    data-index={index}
                                    shadow='none'
                                    onPress={() => onSelect(c)}
                                    {...cardProps}
                                >
                                    <div className={bg} style={{ width: `${progress}%` }} />
                                    <MagicCard className='flex h-full flex-col'>
                                        <CardHeader className='justify-between p-2'>
                                            <h1 className='truncate text-start text-sm font-medium'>
                                                {c?.name}
                                            </h1>

                                            {isFolder(c) && (
                                                <Button
                                                    isIconOnly
                                                    className='bg-background size-7 min-w-0 shrink-0 border'
                                                    radius='full'
                                                    size='sm'
                                                    startContent={<FaFolder size={16} />}
                                                    title='Open folder'
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                            {isPreviewable(c) && (
                                                <Button
                                                    isIconOnly
                                                    className='bg-background size-7 min-w-0 shrink-0 border'
                                                    radius='full'
                                                    size='sm'
                                                    startContent={<FaEye size={16} />}
                                                    title='View file'
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                            {download && (
                                                <Button
                                                    isIconOnly
                                                    className={`bg-background size-6 min-w-0 shrink-0 border ${download.borderColor}`}
                                                    color={download.color}
                                                    isLoading={download.isLoading}
                                                    radius='full'
                                                    size='sm'
                                                    startContent={download.icon}
                                                    title={download.title}
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                        </CardHeader>
                                        <Thumbnail
                                            name={c?.name as string}
                                            src={c?.thumbnails?.[0]?.large?.url || ''}
                                            type='Grid'
                                        />

                                        <CardFooter className='text-muted-foreground grid grid-cols-2 gap-2 p-3 pt-2 text-xs'>
                                            <p className='flex items-center gap-1 truncate text-start'>
                                                <span className='text-[10px]'>📦</span>
                                                {formatBytes(c?.size)}
                                            </p>
                                            <p className='flex items-center justify-end gap-1 truncate text-end'>
                                                <span className='text-[10px]'>🕒</span>
                                                {formatDateTime(c?.lastModifiedDateTime)}
                                            </p>
                                        </CardFooter>
                                    </MagicCard>
                                </Card>
                            </AnimatedDiv>
                        </ContextMenuTrigger>
                        <Menu
                            c={c}
                            open={active?.id === c.id && open}
                            setOpen={(open) => {
                                setActive(c)
                                setOpen(open)
                            }}
                            userRole={userRole}
                            onDelete={handleDelete}
                            onRename={handleRename}
                            onSelected={onSelect}
                        />
                    </ContextMenu>
                )
            })}
            {loadMore && <GridSkeleton />}

            {menuManager()}
        </div>
    )
}
