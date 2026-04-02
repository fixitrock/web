'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TimeAgo from 'react-timeago'
import { ChevronLeft } from 'lucide-react'
import { Button, Card, Skeleton } from '@heroui/react'
import { Navbar } from '@heroui/navbar'

import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { fallback } from '@/config/site'
import { useDebounce } from '@/hooks'
import { useSellerOrders } from '@/hooks/tanstack/query'
import { cn, formatPhone } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { Order } from '@/types/orders'
import { useOrderStore } from '@/zustand/store/orders'

import { OrderDetailsDialog } from './order-details-dialog'
import { ReturnOrder } from './return'

export function OrdersPage({ can, username }: { can: CanType; username: string }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const { data, isLoading } = useSellerOrders(debouncedQuery)
    const router = useRouter()

    return (
        <>
            <Navbar
                shouldHideOnScroll
                className='h-auto w-full flex-col gap-2 p-2 md:flex-row md:gap-4'
                maxWidth='full'
            >
                <div className='flex w-full items-center justify-between gap-1 md:w-auto md:justify-baseline'>
                    <Button
                        className='h-8 w-8 min-w-0 rounded-full p-0'
                        size='sm'
                        variant='ghost'
                        onPress={() => router.push(`/@${username}`)}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <h1 className='text-xl font-bold'>Orders</h1>
                    <div className='size-8 md:hidden' />
                </div>
                <div
                    className={`${can.create.product ? 'lg:w-[30%]' : 'lg:w-[20%]'} flex w-full items-center gap-4 md:w-[50%]`}
                >
                    <Input
                        hotKey='O'
                        placeholder='Search Orders . . . '
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
            </Navbar>
            <OrdersGrid orders={data?.orders || []} />
            {isLoading ? <OrdersSkeleton /> : null}
        </>
    )
}

function OrdersGrid({ orders }: { orders: Order[] }) {
    const { openDetails, openReturn } = useOrderStore()

    const getPaymentStatusBadge = (paid: number, total: number) => {
        const isPaid = paid >= total
        const isPartial = paid > 0 && paid < total
        const badgeConfig = isPaid
            ? { label: 'Paid', className: 'bg-green-500/10 text-green-500 border-green-500/10' }
            : isPartial
              ? { label: 'Partial', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10' }
              : { label: 'Unpaid', className: 'bg-red-500/10 text-red-500 border-red-500/10' }

        return (
            <div className={cn('rounded-lg border px-2 py-0.5 font-medium', badgeConfig.className)}>
                {badgeConfig.label}
            </div>
        )
    }

    return (
        <>
            <div className='grid gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {orders.map((order) => (
                    <Card key={order.id} className='border bg-transparent shadow-none'>
                        <Card.Header className='items-start justify-between'>
                            <div className='flex w-full items-center justify-between'>
                                <div className='flex flex-col'>
                                    <p className='font-mono font-bold tracking-tight select-all'>#{order.id}</p>
                                    <p className='text-muted-foreground text-[10px]'>
                                        {order.userName} - {formatPhone(order.userPhone)}
                                    </p>
                                    <span className='text-muted-foreground text-[9px]'>
                                        <TimeAgo date={order.createdAt || ''} />
                                    </span>
                                </div>
                                {getPaymentStatusBadge(order.paid || 0, order.totalAmount)}
                            </div>
                        </Card.Header>
                        <Card.Content className='py-0'>
                            <div className='bg-default/20 flex items-center gap-4 rounded-xl border p-1'>
                                <Image
                                    alt={order.products?.[0]?.name || 'Product'}
                                    className='bg-background aspect-square rounded-lg border object-cover'
                                    height={96}
                                    src={`${bucketUrl(order.products?.[0]?.image || '')}` || `${fallback.order}`}
                                    width={96}
                                />
                                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                                    <p className='line-clamp-2 leading-tight font-bold'>
                                        {order.products?.[0]?.name || 'Unknown Product'}
                                    </p>
                                    <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                                        <span className='font-semibold'>
                                            Qty: {order.products?.reduce((acc, product) => acc + (product.quantity || 0), 0) || 0}
                                        </span>
                                        {order.products?.[0]?.category ? (
                                            <>
                                                <span>-</span>
                                                <span className='truncate'>{order.products?.[0]?.category}</span>
                                            </>
                                        ) : null}
                                        {order.products?.[0]?.storage ? (
                                            <>
                                                <span>-</span>
                                                <span>{order.products?.[0]?.storage}</span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                        <Card.Footer className='gap-2'>
                            <Button fullWidth size='sm' variant='danger' onPress={() => openReturn(order)}>
                                Return
                            </Button>
                            <Button fullWidth size='sm' variant='primary' onPress={() => openDetails(order)}>
                                Details
                            </Button>
                        </Card.Footer>
                    </Card>
                ))}
            </div>
            <OrderDetailsDialog />
            <ReturnOrder />
        </>
    )
}

export function OrdersSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className='grid gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className={cn('border bg-transparent shadow-none')}>
                    <Card.Header className='flex-row items-center justify-between'>
                        <div className='flex flex-col items-center gap-1'>
                            <Skeleton className='h-4 w-32 rounded-xl' />
                            <Skeleton className='h-2 w-20 rounded-xl' />
                        </div>
                        <Skeleton className='h-5 w-24 rounded-xl' />
                    </Card.Header>
                    <Card.Content className='py-0'>
                        <div className='bg-default/20 flex items-center gap-4 rounded-xl border p-1'>
                            <Skeleton className='size-24 shrink-0 rounded-xl' />
                            <div className='flex min-w-0 flex-1 flex-col gap-2'>
                                <Skeleton className='h-4 w-full rounded-xl' />
                                <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                                    <Skeleton className='h-4 w-1/2 rounded-xl' />
                                    <Skeleton className='h-4 w-1/2 rounded-xl' />
                                </div>
                            </div>
                        </div>
                    </Card.Content>
                    <Card.Footer className='gap-2'>
                        <Skeleton className='h-6 w-full rounded-md' />
                        <Skeleton className='h-6 w-full rounded-md' />
                    </Card.Footer>
                </Card>
            ))}
        </div>
    )
}
