'use client'

import { Card, CardFooter, CardHeader } from '@heroui/react'
import React from 'react'
import Link from 'next/link'

import { useMediaQuery } from '®hooks/useMediaQuery'
import { BlogCardAnimation, fromLeftVariant } from '®lib/FramerMotionVariants'
import { formatBytes, formatDateTime } from '®lib/utils'
import { Drive, DriveItem } from '®types/drive'
import { ContextMenu, ContextMenuTrigger } from '®ui/context-menu'
import AnimatedDiv from '®ui/farmer/div'
import { MagicCard } from '®ui/magiccard'
import { GridSkeleton } from '®ui/skeleton'
import { Thumbnail } from '®ui'
import { Menu } from '®app/(space)/ui'
import { isFolder, isPreviewable } from '®lib/utils'

import { useSelectItem } from '../hooks'
import { getHref } from '../utils'

export function Grid({
    data,
    loadMore,
    focus,
}: {
    data?: Drive
    isLoading?: boolean
    loadMore?: boolean
    focus?: DriveItem | null
}) {
    const [active, setActive] = React.useState<DriveItem | null>(null)
    const [open, setOpen] = React.useState(false)
    const isDesktop = useMediaQuery('(min-width: 640px)')
    const onSelect = useSelectItem(setActive, setOpen)

    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-2 2xl:px-[2rem]'>
            {data?.value.map((c) => {
                const isFolderOrPreviewable = isFolder(c) || isPreviewable(c)
                const href = isFolderOrPreviewable ? getHref(c) : undefined
                const cardProps = href ? { as: Link, href } : {}

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
                                mobileVariants={BlogCardAnimation}
                                variants={fromLeftVariant}
                                className="w-full h-full"
                            >
                                <Card
                                    aria-label={c?.name}
                                    className={`w-full h-full rounded-xl border bg-transparent select-none transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${focus?.name === c.name ? 'ring-2 ring-teal-400/50 bg-teal-400/20 dark:bg-teal-400/25' : ''}`}
                                    shadow='none'
                                    onPress={() => onSelect(c)}
                                    {...cardProps}
                                >
                                    <MagicCard
                                        className="h-full flex flex-col"
                                    >
                                        <CardHeader className='p-3 pb-1'>
                                            <h1 className='truncate text-start text-sm font-medium'>
                                                {c?.name}
                                            </h1>
                                        </CardHeader>
                                        <Thumbnail
                                            name={c?.name as string}
                                            src={c?.thumbnails?.[0]?.large?.url || ''}
                                            type='Grid'
                                        />

                                        <CardFooter className='text-muted-foreground grid grid-cols-2 p-3 pt-2 text-xs gap-2'>
                                            <p className='truncate text-start flex items-center gap-1'>
                                                <span className="text-[10px]">📦</span>
                                                {formatBytes(c?.size)}
                                            </p>
                                            <p className='truncate text-end flex items-center justify-end gap-1'>
                                                <span className="text-[10px]">🕒</span>
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
                            onSelected={onSelect}
                        />
                    </ContextMenu>
                )
            })}
            {loadMore && <GridSkeleton />}
        </div>
    )
}
