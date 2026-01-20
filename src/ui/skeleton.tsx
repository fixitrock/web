'use client'
import { Card, CardBody, CardFooter, CardHeader, Skeleton } from '@heroui/react'
import { Quote } from 'lucide-react'

import { cn } from '@/lib/utils'

import { MagicCard } from './magiccard'

type GridSkeletonProps = {
    length?: number
    className?: string
}

export const GridSkeleton = ({ length = 15, className }: GridSkeletonProps) => {
    if (!length) return null

    return (
        <>
            {Array.from({ length }).map((_, i) => (
                <Card
                    key={i}
                    className={cn('rounded-2xl border bg-transparent', className)}
                    shadow='none'
                >
                    <MagicCard className='items-stretch'>
                        <CardHeader className='justify-between gap-x-2 p-2'>
                            <Skeleton className='h-4 flex-1 rounded-xl' />
                            <Skeleton className='h-6 w-6 rounded-lg' />
                        </CardHeader>
                        <Skeleton className='aspect-square h-40 w-full rounded-2xl' />
                        <CardFooter className='mt-[2px] justify-between p-2'>
                            <Skeleton className='h-4 w-20 rounded-xl' />
                            <Skeleton className='h-4 w-20 rounded-xl' />
                        </CardFooter>
                    </MagicCard>
                </Card>
            ))}
        </>
    )
}

export const QuoteSkeleton = ({
    length = 15,
    className,
}: {
    length?: number
    className?: string
}) => {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <Card
                    key={index}
                    className={cn(
                        'rounded-none border-b bg-transparent p-0 md:rounded-xl md:border',
                        className
                    )}
                    shadow='none'
                >
                    <CardHeader className='flex w-full justify-between'>
                        <div className='flex items-center gap-2'>
                            <Skeleton className='size-10 rounded-full' />
                            <div className='flex flex-col items-start pt-2'>
                                <Skeleton className='h-4 w-20 rounded' />
                                <div className='text-muted-foreground flex items-center gap-1.5'>
                                    <Skeleton className='h-2.5 w-14 rounded' />
                                    ·
                                    <Skeleton className='h-2.5 w-14 rounded' />
                                </div>
                            </div>
                        </div>
                        <Skeleton className='size-8 rounded-full' />
                    </CardHeader>

                    <CardBody className='relative h-52 p-0 px-2 select-none'>
                        <div className='bg-surface dark:bg-muted/30 relative flex h-full items-center justify-center overflow-hidden rounded-xl'>
                            <Quote
                                className='text-muted-foreground pointer-events-none absolute top-4 left-4 rotate-185'
                                size={18}
                            />
                            <Quote
                                className='text-muted-foreground pointer-events-none absolute right-4 bottom-4 rotate-3'
                                size={18}
                            />

                            <div className='flex h-full w-full items-center justify-center px-6 py-4'>
                                <div className='flex w-full max-w-full flex-col gap-3 text-center'>
                                    <Skeleton className='h-5 w-full rounded' />
                                    <Skeleton className='mx-auto h-5 w-4/5 rounded' />
                                    <Skeleton className='mx-auto h-5 w-3/5 rounded' />
                                </div>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className='flex w-full items-center justify-between'>
                        <Skeleton className='h-6 w-16 rounded-full' />
                        <Skeleton className='h-6 w-16 rounded-full' />
                        <Skeleton className='h-6 w-16 rounded-full' />
                        <Skeleton className='h-6 w-16 rounded-full' />
                    </CardFooter>
                </Card>
            ))}
        </>
    )
}

export const ListSkeleton = () => {
    return (
        <>
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className='flex items-center gap-2 rounded-lg border p-1'>
                    <Skeleton className='size-10 shrink-0 rounded-lg' />
                    <div className='flex grow flex-col gap-y-2'>
                        <Skeleton className='h-4 w-auto rounded-lg sm:max-w-lg' />
                        <span className='text-muted-foreground flex items-center gap-2 text-xs'>
                            <Skeleton className='h-4 w-14 rounded-lg sm:w-20' /> •{' '}
                            <Skeleton className='h-4 w-14 rounded-lg sm:w-20' /> •{' '}
                            <Skeleton className='h-4 w-14 rounded-lg sm:w-20' />
                        </span>
                    </div>
                    <div className='mr-2 flex-1'>
                        <div className='flex items-end justify-end'>
                            <Skeleton className='size-8 justify-end rounded-lg' />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export const SpaceSearchSkeleton = () => {
    return (
        <>
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                    <Skeleton className='size-10 shrink-0 rounded-lg' />
                    <div className='flex grow flex-col gap-y-2'>
                        <Skeleton className='h-4 w-auto rounded-lg sm:max-w-sm' />
                        <span className='text-muted-foreground flex items-center gap-2 text-xs'>
                            <Skeleton className='h-4 w-14 rounded-lg sm:w-20' /> •
                            <Skeleton className='h-4 w-14 rounded-lg sm:w-20' />
                        </span>
                    </div>
                </div>
            ))}
        </>
    )
}

export const MarkdownSkeleton = () => {
    return (
        <div aria-busy='true' className='flex flex-col gap-4'>
            {/* Title */}
            <Skeleton className='h-6 w-3/4 rounded-md' />

            {/* Text Lines */}
            <Skeleton className='h-4 w-full rounded-md' />
            <Skeleton className='h-4 w-5/6 rounded-md' />
            <Skeleton className='h-4 w-4/6 rounded-md' />

            {/* Code Block / Image */}
            <Skeleton className='h-32 w-full rounded-md' />
        </div>
    )
}

export function FRPSkeleton() {
    return (
        <div className='grid grid-cols-3 md:grid-cols-4'>
            {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className='flex flex-col items-center space-y-2 p-3'>
                    <Skeleton className='h-16 w-16 rounded-2xl' />
                    <Skeleton className='h-3 w-12 rounded-full' />
                </div>
            ))}
        </div>
    )
}

export function TransactionSkeleton({ length = 10 }: { length?: number }) {
    return (
        <>
            {Array.from({ length }).map((_, i) => (
                <div key={i} className='flex items-center gap-2 px-2 py-1.5'>
                    <Skeleton className='size-8 rounded-full' />
                    <div className='flex flex-1 flex-col gap-1'>
                        <Skeleton className='h-4 w-24 rounded-lg' />
                        <Skeleton className='h-3 w-32 rounded-lg' />
                    </div>
                    <Skeleton className='h-6 w-16 rounded' />
                </div>
            ))}
        </>
    )
}
