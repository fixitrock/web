'use client'

import { Skeleton } from '@heroui/react'

export function ProductSkeleton() {
    return (
        <div className='group flex flex-col gap-2 rounded-2xl border p-1.5'>
            <Skeleton className='aspect-square rounded-2xl' />
            <div className='flex flex-1 flex-col space-y-1'>
                <Skeleton className='line-clamp-1 h-4 w-[60%] rounded-full text-sm font-semibold' />
                <div className='text-muted-foreground flex w-full justify-between text-xs'>
                    <Skeleton className='h-4 w-16 rounded-lg' />
                    <Skeleton className='h-4 w-16 rounded-lg' />
                </div>
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 18 }: { count?: number }) {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    )
}
