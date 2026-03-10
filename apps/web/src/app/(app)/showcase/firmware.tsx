'use client'

import { Card, CardHeader, CardFooter } from '@heroui/react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import React from 'react'
import { TbDatabaseStar, TbPlugConnectedX } from 'react-icons/tb'
import { ImOnedrive } from 'react-icons/im'

import { useDrive } from '@tanstack/query'
import { formatBytes, formatDateTime } from '@/lib/utils'
import { DriveItem } from '@/types/drive'
import { TitleAction } from '@/ui'
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'
import { ContextMenu, ContextMenuTrigger } from '@/ui/context-menu'
import { GridSkeleton } from '@/ui/skeleton'
import { ErrorState } from '@/ui/state'
import { Thumbnail } from '@/ui'
import { Menu } from '@/app/(space)/ui'

export default function Firmware() {
    const { data, isLoading, selectItem, error } = useDrive('', 12)
    const [active, setActive] = React.useState<DriveItem | null>(null)
    const [open, setOpen] = React.useState(false)

    return (
        <TitleAction href='/space' title='Firmware'>
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 3000,
                    }),
                ]}
            >
                <CarouselContent>
                    {isLoading ? (
                        <GridSkeleton className='min-w-[300px]' length={6} />
                    ) : error ? (
                        <ErrorState
                            icons={[TbDatabaseStar, ImOnedrive, TbPlugConnectedX]}
                            message={error.message}
                            title='OneDrive API says "Nope, Not Today.'
                        />
                    ) : (
                        data?.value.map((c: DriveItem) => (
                            <CarouselItem key={c.id} className='basis-[300px]'>
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
                                    <ContextMenuTrigger>
                                        <Card
                                            aria-label={c?.name}
                                            as={Link}
                                            className='w-full rounded-2xl border bg-transparent select-none'
                                            href={`/space/${c.name}`}
                                            shadow='none'
                                        >
                                            <CardHeader className='mb-px p-2'>
                                                <h1 className='truncate text-start text-[13px]'>
                                                    {c?.name}
                                                </h1>
                                            </CardHeader>
                                            <Thumbnail
                                                name={c?.name as string}
                                                src={c?.thumbnails?.[0]?.large?.url || ''}
                                                type='Grid'
                                            />
                                            <CardFooter className='text-muted-foreground grid grid-cols-3 p-2 text-xs'>
                                                <p className='truncate text-start'>
                                                    {formatBytes(c?.size)}
                                                </p>
                                                <p className='truncate text-center' />
                                                <p className='truncate text-right'>
                                                    {formatDateTime(c?.lastModifiedDateTime)}
                                                </p>
                                            </CardFooter>
                                        </Card>
                                    </ContextMenuTrigger>
                                    <Menu
                                        c={c}
                                        open={active?.id === c.id && open}
                                        setOpen={(open) => {
                                            setActive(c)
                                            setOpen(open)
                                        }}
                                        userRole={undefined}
                                        onSelected={selectItem}
                                    />
                                </ContextMenu>
                            </CarouselItem>
                        ))
                    )}
                </CarouselContent>
            </Carousel>
        </TitleAction>
    )
}
