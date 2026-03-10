'use client'
import { ShoppingBag, Store } from 'lucide-react'
import { Skeleton, Image } from '@heroui/react'
import { Carousel, CarouselContent, CarouselItem } from '@/ui/carousel'
import { formatPrice } from '@/lib/utils'
import TimeAgo from 'react-timeago'
import { fallback } from '@/config/site'
import { RecentOrder } from '@/types/orders'

export function RecentOrders({ recent }: { recent: RecentOrder[] }) {
    const noOrders = !recent || recent.length === 0

    return (
        <>
            {noOrders ? (
                <NoOrders />
            ) : (
                <Carousel
                    opts={{
                        align: 'start',
                        loop: false,
                    }}
                    className='w-full'
                >
                    <CarouselContent className='select-none'>
                        {recent.map((order) => (
                            <CarouselItem
                                key={order.id}
                                className='sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
                            >
                                <div className='group relative overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <Image
                                                src={
                                                    fallback.user +
                                                    `${order.name}.svg?text=${order.name.charAt(0)}`
                                                }
                                                alt={order.name}
                                                className='aspect-square size-10 rounded-full object-cover'
                                                removeWrapper
                                            />

                                            <div className='overflow-hidden'>
                                                <p className='truncate leading-none font-medium'>
                                                    {order.name}
                                                </p>
                                                <p className='text-muted-foreground truncate text-xs'>
                                                    <TimeAgo date={order.created_at} />
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-end justify-between'>
                                        <div className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                                            <ShoppingBag className='h-4 w-4' />
                                            <span>
                                                {order.item_count} item
                                                {order.item_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <p className='text-lg font-bold tracking-tight'>
                                            {formatPrice(order.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )}
        </>
    )
}

export function RecentOrderSkeleton() {
    return (
        <Carousel
            opts={{
                align: 'start',
                loop: false,
            }}
            className='w-full'
        >
            <CarouselContent className='select-none'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <CarouselItem key={i} className='sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                        <div className='group relative overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-center gap-3'>
                                    <Skeleton className='h-12 w-12 rounded-lg' />
                                    <div className='space-y-1'>
                                        <Skeleton className='h-4 w-24 rounded-lg' />
                                        <Skeleton className='h-3 w-16 rounded-lg' />
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-end justify-between'>
                                <Skeleton className='h-4 w-16 rounded-lg' />
                                <Skeleton className='h-6 w-20 rounded-lg' />
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}

function NoOrders() {
    return (
        <div className='bg-default/05 flex flex-col items-center justify-center rounded-xl border p-3'>
            <div className='bg-muted-foreground/10 text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
                <Store className='size-5 text-amber-400' />
            </div>

            <h1 className='text-foreground text-lg font-semibold'>No recent orders</h1>
            <p className='text-muted-foreground mt-1 text-sm'>
                Data will appear once you have orders.
            </p>
        </div>
    )
}
