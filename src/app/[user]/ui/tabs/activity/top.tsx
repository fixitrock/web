'use client'

import { Layers, LucideIcon, Package, Tag, TrendingUp } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'
import { TopItem, TopStats } from '@/types/orders'
import { Counts } from '@/lib/utils'
import { Skeleton } from '@heroui/react'

export function TopSection({ top }: { top: TopStats }) {
    return (
        <>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <TopCarousel
                    title='Brands'
                    icon={Tag}
                    iconColor='text-blue-500'
                    top={top.top_brands}
                />
                <TopCarousel
                    title='Categories'
                    icon={Layers}
                    iconColor='text-purple-500'
                    top={top.top_categories}
                />
            </div>

            <TopCarousel
                title='Products'
                icon={Package}
                iconColor='text-green-500'
                top={top.top_products}
                basis='sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
            />
        </>
    )
}

export function TopSectionSkeleton() {
    return (
        <>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <TopSkeleton title='Brands' icon={Tag} iconColor='text-blue-500' />
                <TopSkeleton title='Categories' icon={Layers} iconColor='text-purple-500' />
            </div>

            <TopSkeleton
                title='Products'
                icon={Package}
                iconColor='text-green-500'
                basis='sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
            />
        </>
    )
}

interface CommonProps {
    title: string
    icon: LucideIcon
    iconColor?: string
    basis?: string
}

interface TopCarouselProps extends CommonProps {
    top?: TopItem[]
}

function TopCarousel({
    title,
    icon: Icon,
    top = [],
    iconColor = 'text-foreground',
    basis = 'sm:basis-1/2',
}: TopCarouselProps) {
    const empty = top.length === 0

    return (
        <div className='w-full space-y-2'>
            <div className='flex items-center justify-between px-1'>
                <div className='flex items-center gap-2'>
                    <Icon className={`size-5 ${iconColor}`} />
                    <h3 className='text-lg font-semibold tracking-tight'>Top {title}</h3>
                </div>
                {!empty && <span className='text-muted-foreground text-xs'>Swipe to see more</span>}
            </div>

            {empty ? (
                <EmptyState title={title} icon={Icon} iconColor={iconColor} />
            ) : (
                <Carousel opts={{ align: 'start', loop: false }} className='w-full'>
                    <CarouselContent className='select-none'>
                        {top.map((t, i) => (
                            <CarouselItem key={t.name} className={basis}>
                                <Card item={t} rank={i + 1} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )}
        </div>
    )
}

function Card({ item, rank }: { item: TopItem; rank: number }) {
    return (
        <div className='group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all'>
            <div>
                <p className='truncate leading-none font-medium'>{item.name}</p>
                <p className='text-muted-foreground mt-1 truncate text-xs'>Ranked #{rank}</p>
            </div>

            <div className='flex items-end justify-between'>
                <div className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                    <TrendingUp className='h-3 w-3' />
                    <span className='text-xs'>{item.sales_count}</span>
                </div>
                <p className='text-lg font-bold tracking-tight'>{Counts(item.total_amount)}</p>
            </div>
        </div>
    )
}

function EmptyState({
    title,
    icon: Icon,
    iconColor,
}: {
    title: string
    icon: LucideIcon
    iconColor?: string
}) {
    return (
        <div className='flex flex-col items-center justify-center rounded-xl border p-3'>
            <div className='bg-muted-foreground/10 text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
                <Icon className={`size-5 ${iconColor}`} />
            </div>
            <h1 className='text-foreground text-lg font-semibold'>No {title}</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
                Data will appear once you have orders.
            </p>
        </div>
    )
}

function TopSkeleton({
    title,
    icon: Icon,
    iconColor = 'text-foreground',
    basis = 'sm:basis-1/2',
}: CommonProps) {
    return (
        <div className='w-full space-y-2'>
            <div className='flex items-center gap-2 px-1'>
                <Icon className={`size-5 ${iconColor}`} />
                <h3 className='text-lg font-semibold tracking-tight'>Top {title}</h3>
            </div>

            <Carousel opts={{ align: 'start', loop: false }} className='w-full'>
                <CarouselContent className='select-none'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <CarouselItem key={i} className={basis}>
                            <SkeletonCard />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}

function SkeletonCard() {
    return (
        <div className='rounded-xl border p-4 backdrop-blur-sm'>
            <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-1'>
                    <Skeleton className='h-4 w-24 rounded-lg' />
                    <Skeleton className='h-3 w-16 rounded-lg' />
                </div>
            </div>

            <div className='mt-4 flex items-end justify-between'>
                <Skeleton className='h-4 w-16 rounded-lg' />
                <Skeleton className='h-6 w-20 rounded-lg' />
            </div>
        </div>
    )
}
