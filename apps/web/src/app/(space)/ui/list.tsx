'use client'

import { Button, Card, CardBody } from '@heroui/react'
import React from 'react'
import Link from 'next/link'
import { CornerDownLeft } from 'lucide-react'
import { FaEye, FaFolder } from 'react-icons/fa'

import { BlogCardAnimation, fromTopVariant } from '@/lib/FramerMotionVariants'
import { formatBytes, formatCount, formatDateTime, getDownloadBackground } from '@/lib/utils'
import { Drive, DriveItem } from '@/types/drive'
import { ContextMenu, ContextMenuTrigger } from '@/ui/context-menu'
import AnimatedDiv from '@/ui/farmer/div'
import { ListSkeleton } from '@/ui/skeleton'
import { Thumbnail } from '@/ui'
import { Menu } from '@/app/(space)/ui'
import { useKeyboardNavigation } from '@/hooks'
import { useDownloadStore } from '@/zustand/store'
import { useChild } from '@/zustand/store'

import { getHref } from '../utils'
import { useSelectItem, useMenuManager } from '../hooks'

import { DownloadSwitch } from './download/switch'

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
            const c = data?.value?.[index]

            if (c) onSelect(c)
        },
    })

    return (
        <div ref={listRef} className='flex flex-col gap-2'>
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
                          size: 18,
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
                                key={c.id}
                                mobileVariants={BlogCardAnimation}
                                variants={fromTopVariant}
                            >
                                <Card
                                    key={c.id}
                                    isHoverable
                                    aria-label={c?.name}
                                    className={`group data-[hover=true]:bg-muted/30 relative w-full rounded-xl border bg-transparent p-0 transition-all duration-200 select-none active:scale-[0.98] dark:data-[hover=true]:bg-[#0a0a0a] ${
                                        selectedIndex === index
                                            ? 'border-purple-400/60 bg-purple-50/30 ring-1 ring-purple-400/30 dark:border-purple-400/50 dark:bg-purple-950/20'
                                            : focus?.name === c.name
                                              ? 'border-indigo-400/40 bg-indigo-50/20 ring-1 ring-indigo-400/20 dark:border-indigo-400/30 dark:bg-indigo-950/15'
                                              : ''
                                    }`}
                                    shadow='none'
                                    onPress={() => onSelect(c)}
                                    {...cardProps}
                                    data-index={index}
                                >
                                    <div
                                        className={bg}
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />

                                    <CardBody className='flex flex-row items-center gap-2 p-2'>
                                        <Thumbnail
                                            name={c?.name as string}
                                            src={c?.thumbnails?.[0]?.large?.url}
                                            type='List'
                                        />
                                        <div className='min-w-0 flex-1 space-y-1'>
                                            <h2 className='truncate text-start text-sm font-medium'>
                                                {c?.name}
                                            </h2>
                                            <div className='text-muted-foreground flex flex-nowrap gap-x-2 gap-y-0.5 text-[10px] sm:text-xs'>
                                                {[
                                                    c?.size && (
                                                        <span
                                                            key='size'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>📦</span>
                                                            {formatBytes(c.size)}
                                                        </span>
                                                    ),
                                                    c?.folder?.childCount && (
                                                        <span
                                                            key='count'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>📁</span>
                                                            {formatCount(c.folder.childCount)}
                                                        </span>
                                                    ),
                                                    c?.lastModifiedDateTime && (
                                                        <span
                                                            key='date'
                                                            className='flex items-center gap-1'
                                                        >
                                                            <span className='text-[10px]'>🕒</span>
                                                            {formatDateTime(c.lastModifiedDateTime)}
                                                        </span>
                                                    ),
                                                ]
                                                    .filter(Boolean)
                                                    .map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className='inline-flex items-center'
                                                        >
                                                            {item}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                        <div className='mr-2 flex items-center gap-2'>
                                            {isFolder(c) && (
                                                <Button
                                                    isIconOnly
                                                    className='border'
                                                    size='sm'
                                                    startContent={<FaFolder size={18} />}
                                                    title='Open folder'
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                            {isPreviewable(c) && (
                                                <Button
                                                    isIconOnly
                                                    className='border'
                                                    size='sm'
                                                    startContent={<FaEye size={18} />}
                                                    title='View file'
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                            {download && (
                                                <Button
                                                    isIconOnly
                                                    className={`bg-background border ${download.borderColor}`}
                                                    color={download.color}
                                                    isLoading={download.isLoading}
                                                    size='sm'
                                                    startContent={download.icon}
                                                    title={download.title}
                                                    variant='light'
                                                    onPress={() => onSelect(c)}
                                                />
                                            )}
                                            {selectedIndex === index && (
                                                <Button
                                                    isIconOnly
                                                    className='bg-background border'
                                                    size='sm'
                                                    startContent={<CornerDownLeft size={18} />}
                                                    title='Select item'
                                                    variant='light'
                                                />
                                            )}
                                        </div>
                                    </CardBody>
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
            {loadMore && <ListSkeleton />}

            {menuManager()}
        </div>
    )
}
