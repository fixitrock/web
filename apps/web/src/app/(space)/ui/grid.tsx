'use client'

import { Link } from '@heroui/react'
import React from 'react'
import { FaEye, FaFolder } from 'react-icons/fa'

import { Menu, SpaceButton } from '@/app/(space)/ui'
import { useKeyboardNavigation } from '@/hooks'
import { useMenuManager, useSelectItem } from '@/app/(space)/hooks'
import { BlogCardAnimation, fromLeftVariant } from '@/lib/FramerMotionVariants'
import { formatBytes, formatDateTime, getDownloadBackground } from '@/lib/utils'
import { Drive, DriveItem } from '@/types/drive'
import { ContextMenu, ContextMenuTrigger } from '@/ui/context-menu'
import AnimatedDiv from '@/ui/farmer/div'
import { MagicCard } from '@/ui/magiccard'
import { GridSkeleton } from '@/ui/skeleton'
import { Thumbnail } from '@/ui'
import { useDownloadStore } from '@/zustand/store'
import { useChild } from '@/zustand/store'

import { DownloadSwitch } from './download/switch'
import { getHref } from '../utils'

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
            const item = data?.value?.[index]
            if (item) onSelect(item)
        },
    })

    return (
        <div ref={listRef} className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4'>
            {data?.value.map((c, index) => {
                const isFolderOrPreviewable = isFolder(c) || isPreviewable(c)
                const href = isFolderOrPreviewable ? getHref(c) : undefined
                const bg = getDownloadBackground(downloads.get(c.id))
                const progress = downloads.get(c.id)?.progress || 0
                const download = isDownloadable(c) ? DownloadSwitch({ c: c, downloads }) : null

                return (
                    <ContextMenu
                        key={c.id}
                        onOpenChange={(nextOpen) => {
                            setOpen(nextOpen)
                            setActive(nextOpen ? c : null)
                        }}
                    >
                        <ContextMenuTrigger onClick={() => onSelect(c)}>
                            <AnimatedDiv
                                ref={getItemRef(index)}
                                className='h-full w-full'
                                mobileVariants={BlogCardAnimation}
                                variants={fromLeftVariant}
                            >
                                <Link
                                    href={href}
                                    onPress={() => onSelect(c)}
                                    data-index={index}
                                    aria-label={c.name}
                                    className={`h-full w-full overflow-hidden rounded-xl border bg-transparent transition-all duration-200 select-none hover:scale-[1] ${
                                        selectedIndex === index
                                            ? 'border-purple-400/60 bg-purple-50/30 ring-1 ring-purple-400/30 dark:border-purple-400/50 dark:bg-purple-950/20'
                                            : focus?.name === c.name
                                              ? 'border-indigo-400/40 bg-indigo-50/20 ring-1 ring-indigo-400/20 dark:border-indigo-400/30 dark:bg-indigo-950/15'
                                              : ''
                                    }`}
                                >
                                    <div className={bg} style={{ width: `${progress}%` }} />

                                    <MagicCard className='flex size-full flex-col p-2'>
                                        <div className='flex items-center justify-between'>
                                            <h1 className='truncate text-start text-sm font-medium'>
                                                {c.name}
                                            </h1>
                                            {isFolder(c) ? (
                                                <SpaceButton
                                                    icon={<FaFolder size={16} />}
                                                    label='Open folder'
                                                    onPress={() => onSelect(c)}
                                                />
                                            ) : null}
                                            {isPreviewable(c) ? (
                                                <SpaceButton
                                                    icon={<FaEye size={16} />}
                                                    label='View file'
                                                    onPress={() => onSelect(c)}
                                                />
                                            ) : null}
                                            {download ? (
                                                <SpaceButton
                                                    className={download.borderColor}
                                                    icon={download.icon}
                                                    isPending={Boolean(download.isLoading)}
                                                    label={download.title}
                                                    onPress={() => onSelect(c)}
                                                />
                                            ) : null}
                                        </div>
                                        <Thumbnail
                                            className='my-1'
                                            name={c.name as string}
                                            src={c.thumbnails?.[0]?.large?.url || ''}
                                            type='Grid'
                                        />
                                        <div className='text-muted-foreground grid grid-cols-2 gap-2 pt-1 text-xs'>
                                            <p className='flex items-center gap-1 truncate text-start'>
                                                <span className='text-[10px]'>📦</span>

                                                {formatBytes(c?.size)}
                                            </p>
                                            <p className='flex items-center justify-end gap-1 truncate text-end'>
                                                <span className='text-[10px]'>🕒</span>

                                                {formatDateTime(c?.lastModifiedDateTime)}
                                            </p>
                                        </div>
                                    </MagicCard>
                                </Link>
                            </AnimatedDiv>
                        </ContextMenuTrigger>
                        <Menu
                            c={c}
                            open={active?.id === c.id && open}
                            setOpen={(nextOpen) => {
                                setActive(c)
                                setOpen(nextOpen)
                            }}
                            userRole={userRole}
                            onDelete={handleDelete}
                            onRename={handleRename}
                            onSelected={onSelect}
                        />
                    </ContextMenu>
                )
            })}
            {loadMore ? <GridSkeleton /> : null}
            {menuManager()}
        </div>
    )
}