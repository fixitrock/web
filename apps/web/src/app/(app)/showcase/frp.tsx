'use client'

import { Card, CardFooter, CardHeader, Image } from '@heroui/react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { SiSupabase } from 'react-icons/si'
import { TbDatabaseStar, TbPlugConnectedX } from 'react-icons/tb'

import { useSupabse } from '@tanstack/query'
import { formatDateTime } from '@/lib/utils'
import { TitleAction } from '@/ui'
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'
import { GridSkeleton } from '@/ui/skeleton'
import { ErrorState } from '@/ui/state'
import { FRP as Types } from '@/types/invoice'

export default function FRP() {
    const { data, isLoading, error } = useSupabse<Types>('frp')

    return (
        <TitleAction href='/frp' title='FRP Bypass'>
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 2500,
                    }),
                ]}
            >
                <CarouselContent>
                    {isLoading ? (
                        <GridSkeleton className='min-w-[300px]' length={6} />
                    ) : error ? (
                        <ErrorState
                            icons={[TbDatabaseStar, SiSupabase, TbPlugConnectedX]}
                            message={error.message}
                            title='Yo, FRP Data is MIA'
                        />
                    ) : (
                        data?.slice(0, 6).map((f) => (
                            <CarouselItem key={f.id} className='basis-[300px]'>
                                <Card
                                    aria-label={f.title}
                                    className='w-full rounded-2xl border bg-transparent'
                                    shadow='none'
                                >
                                    <Link passHref href={f.link} target='_blank'>
                                        <CardHeader className='mb-px p-2'>
                                            <h1 className='line-clamp-1 text-start text-[13px]'>
                                                {f.title}
                                            </h1>
                                        </CardHeader>
                                        <Image
                                            isBlurred
                                            alt={f.title}
                                            className='bg-default/5 dark:bg-default/10 aspect-video h-40 rounded-lg object-contain p-2'
                                            classNames={{ wrapper: 'mx-auto' }}
                                            loading='lazy'
                                            src={f.img}
                                        />
                                        <CardFooter className='text-muted-foreground justify-end p-2 text-xs'>
                                            <p>{formatDateTime(f.created_at)}</p>
                                        </CardFooter>
                                    </Link>
                                </Card>
                            </CarouselItem>
                        ))
                    )}
                </CarouselContent>
            </Carousel>
        </TitleAction>
    )
}
