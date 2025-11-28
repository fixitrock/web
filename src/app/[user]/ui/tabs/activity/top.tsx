'use client'

import { LucideIcon, TrendingUp } from 'lucide-react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/ui/carousel'
import { TopItem } from '@/types/orders'
import { Counts } from '@/lib/utils'
import { Skeleton } from '@heroui/react'

interface TopCarouselProps {
    title: string
    icon: LucideIcon
    top: TopItem[]
    iconColor?: string
    basis?: string
    isLoading: boolean
}


export function TopCarousel({ title, icon: Icon, top, iconColor = 'text-foreground', basis, isLoading }: TopCarouselProps) {
    const noTop = !isLoading && (!top || top.length === 0)
    return (
        <div className='w-full space-y-2'>
            <div className='flex items-center justify-between px-1'>
                <div className='flex items-center gap-2'>
                    <Icon className={`size-5 ${iconColor}`} />
                    <h3 className='text-lg font-semibold tracking-tight'>Top {title}</h3>
                </div>
                 {!noTop && (
                    <span className="text-xs text-muted-foreground">Swipe to see more</span>
                )}
            </div>
{noTop && (
  <div className="flex flex-col items-center justify-center p-3 border rounded-xl">
    <div className="flex items-center justify-center h-12 w-12 rounded-full 
                    bg-muted-foreground/10 text-muted-foreground mb-3">
      <Icon className={`size-5 ${iconColor}`} />
    </div>

    <h1 className="text-lg font-semibold text-foreground">
      No {title}
    </h1>
    <p className="text-sm text-muted-foreground mt-1">
      Data will appear once you have orders.
    </p>
  </div>
)}


            <Carousel
                opts={{
                    align: 'start',
                    loop: false,
                }}
                className='w-full'
            >
                  {!noTop && (
                <CarouselContent className='select-none'>
                    {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <CarouselItem
                                      key={i}
                                      className={basis}
                                  >
                                      <div className="group relative overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all">
                                          <div className="flex items-start justify-between">
                                              <div className="flex items-center gap-3">
                                                  <Skeleton className="h-10 w-10 rounded-full" />
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-24 rounded-lg" />
                                                      <Skeleton className="h-3 w-16 rounded-lg" />
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex items-end justify-between">
                                              <Skeleton className="h-4 w-16 rounded-lg" />
                                              <Skeleton className="h-6 w-20 rounded-lg" />
                                          </div>
                                      </div>
                                  </CarouselItem>
                              ))
                            :top.map((top, index) => (
                        <CarouselItem key={top.name} className={basis}>
                            <div
                                className='group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 backdrop-blur-sm transition-all'
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='overflow-hidden'>
                                            <p className='truncate font-medium leading-none'>{top.name}</p>
                                            <p className='mt-1 truncate text-xs text-muted-foreground'>Ranked #{index + 1}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-end justify-between'>
                                    <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                                        <TrendingUp className='h-3 w-3' />
                                        <span className='text-xs'>{top.sales_count}</span>
                                    </div>
                                    <p className='text-lg font-bold tracking-tight'>
                                        {Counts(top.total_amount)}
                                    </p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                )}
            </Carousel>
        </div>
    )
}
