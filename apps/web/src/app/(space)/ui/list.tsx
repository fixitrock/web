'use client'

import { Card, Link } from '@heroui/react'
import React from 'react'
import { CornerDownLeft } from 'lucide-react'
import { FaEye, FaFolder } from 'react-icons/fa'

import { BlogCardAnimation, fromTopVariant } from '@/lib/FramerMotionVariants'
import { formatBytes, formatCount, formatDateTime, getDownloadBackground } from '@/lib/utils'
import { Drive, DriveItem } from '@/types/drive'
import { ContextMenu, ContextMenuTrigger } from '@/ui/context-menu'
import AnimatedDiv from '@/ui/farmer/div'
import { ListSkeleton } from '@/ui/skeleton'
import { Thumbnail } from '@/ui'
import { Menu, SpaceButton } from '@/app/(space)/ui'
import { useKeyboardNavigation } from '@/hooks'
import { useDownloadStore } from '@/zustand/store'
import { useChild } from '@/zustand/store'

import { useSelectItem, useMenuManager } from '../hooks'

import { DownloadSwitch } from './download/switch'
import { getHref } from '../utils'

export function List({
    data,
    loadMore,
    focus,
    userRole,
}: {
    data?: Drive
    isLoading?: boolean
    loadMore?: boolean
    focus?: DriveItem | null
    ref: React.Ref<HTMLDivElement>

    userRole?: number
}) {
    const [active, setActive] = React.useState<DriveItem | null>(null)
    const [open, setOpen] = React.useState(false)
    const onSelect = useSelectItem(setActive, setOpen)
    const { downloads } = useDownloadStore()
    const { isFolder, isPreviewable, isDownloadable } = useChild()
    const { handleRename, handleDelete, menuManager } = useMenuManager()
    const { selectedIndex, listRef } = useKeyboardNavigation({
        length: data?.value.length ?? 0,
        mode: 'list',
        onSelect: (index) => {
            const item = data?.value?.[index]

            if (item) onSelect(item)
        },
    })

    return (
        <div ref={listRef} className='flex flex-col gap-2'>
            {data?.value.map((c, index) => {
                const isFolderOrPreviewable = isFolder(c) || isPreviewable(c)
                const href = isFolderOrPreviewable ? getHref(c) : undefined
                const bg = getDownloadBackground(downloads.get(c.id))
                const progress = downloads.get(c.id)?.progress || 0
                const download = isDownloadable(c)
                    ? DownloadSwitch({
                          c: c,
                          downloads,
                          size: 18,
                      })
                    : null

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
                                mobileVariants={BlogCardAnimation}
                                variants={fromTopVariant}
                            >
                                <Link
                                    href={href}
                                    onPress={() => onSelect(c)}
                                    data-index={index}
                                    aria-label={c.name}
                                    className={`hover:bg-default/20 h-full w-full overflow-hidden rounded-lg border bg-transparent transition-all duration-200 select-none hover:scale-[1] ${
                                        selectedIndex === index
                                            ? 'border-purple-400/60 bg-purple-50/30 ring-1 ring-purple-400/30 dark:border-purple-400/50 dark:bg-purple-950/20'
                                            : focus?.name === c.name
                                              ? 'border-indigo-400/40 bg-indigo-50/20 ring-1 ring-indigo-400/20 dark:border-indigo-400/30 dark:bg-indigo-950/15'
                                              : ''
                                    }`}
                                >
                                    <div className='flex w-full items-center p-2'>
                                        <div className={bg} style={{ width: `${progress}%` }} />
                                        <Thumbnail
                                            className='mr-1'
                                            name={c.name as string}
                                            src={c.thumbnails?.[0]?.large?.url}
                                            type='List'
                                        />
                                        <div className='min-w-0 flex-1 space-y-1'>
                                            <h2 className='truncate text-start text-[14px] font-medium'>
                                                {c.name}
                                            </h2>
                                            <div className='text-muted-foreground flex flex-nowrap gap-x-2 gap-y-0.5 text-[10px] sm:text-[12px]'>
                                                {[
                                                    c.size ? (
                                                        <span
                                                            key='size'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>📦</span>
                                                            {formatBytes(c.size)}
                                                        </span>
                                                    ) : null,
                                                    c.folder?.childCount ? (
                                                        <span
                                                            key='count'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>📁</span>
                                                            {formatCount(c.folder.childCount)}
                                                        </span>
                                                    ) : null,
                                                    c.lastModifiedDateTime ? (
                                                        <span
                                                            key='date'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>🕒</span>
                                                            {formatDateTime(c.lastModifiedDateTime)}
                                                        </span>
                                                    ) : null,
                                                ]
                                                    .filter(Boolean)
                                                    .map((detail, detailIndex) => (
                                                        <span
                                                            key={detailIndex}
                                                            className='inline-flex items-center'
                                                        >
                                                            {detail}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                        <div className='mr-2 flex items-center gap-2'>
                                            {isFolder(c) ? (
                                                <SpaceButton
                                                    icon={<FaFolder size={18} />}
                                                    label='Open folder'
                                                    onPress={() => onSelect(c)}
                                                />
                                            ) : null}
                                            {isPreviewable(c) ? (
                                                <SpaceButton
                                                    icon={<FaEye size={18} />}
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
                                            {selectedIndex === index ? (
                                                <SpaceButton
                                                    className='bg-background'
                                                    icon={<CornerDownLeft size={18} />}
                                                    label='Selected item'
                                                />
                                            ) : null}
                                        </div>
                                    </div>
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
            {loadMore ? <ListSkeleton /> : null}
            {menuManager()}
        </div>
    )
}
