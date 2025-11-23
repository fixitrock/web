'use client'

import { useState } from 'react'
import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { Button, Card, CardBody, CardFooter, CardHeader, cn, Navbar, Skeleton, Image } from '@heroui/react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSellerOrders } from '@/hooks/tanstack/query'
import { useOrderStore } from '@/zustand/store/orders'
import { formatDateTime, formatPhone } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { fallback } from '@/config/site'
import { ReturnOrder } from './return'
import { OrderDetailsDialog } from './order-details-dialog'
import { Order } from '@/types/orders'
import { useDebounce } from '@/hooks'

export function OrdersPage({ can, username }: { can: CanType; username: string; }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const { data, isLoading } = useSellerOrders(debouncedQuery)

    return (
        <>
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper: 'h-auto w-full flex-col gap-2 p-2 md:flex-row md:gap-4',
                }}
                maxWidth='full'
            >
                <div className='flex w-full items-center justify-between gap-1 md:w-auto md:justify-baseline'>
                    <Button
                        as={Link}
                        className='h-8 w-8 min-w-0 p-0'
                        href={`/@${username}`}
                        radius='full'
                        size='sm'
                        variant='light'
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
                        placeholder='Search Orders . . . '
                        hotKey='O'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </Navbar>
            <OrdersGrid orders={data?.orders || []} />
            {isLoading && <OrdersSkeleton />}
        </>

    )
}


function OrdersGrid({ orders }: { orders: Order[] }) {
    const { openDetails, openReturn } = useOrderStore()

    const getPaymentStatusBadge = (paid: number, total: number) => {
        const isPaid = paid >= total;
        const isPartial = paid > 0 && paid < total;

        const badgeConfig = isPaid
            ? { label: "Paid", color: "green" }
            : isPartial
                ? { label: "Partial", color: "yellow" }
                : { label: "Unpaid", color: "red" };

        const colorClasses: Record<string, string> = {
            green: "bg-green-500/10 text-green-500 border-green-500/10",
            yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/10",
            red: "bg-red-500/10 text-red-500 border-red-500/10",
        };

        return (
            <div
                className={cn(
                    "px-2 py-0.5 rounded-lg border font-medium",
                    colorClasses[badgeConfig.color]
                )}
            >
                {badgeConfig.label}
            </div>
        );
    };

    return (
        <>
            <div className='grid gap-3 p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {orders.map((order) => (
                    <Card key={order.id} className='border bg-transparent shadow-none'>
                        <CardHeader className='items-start justify-between'>
                            <div className='flex w-full items-center justify-between'>
                                <div className='flex flex-col'>
                                    <p className='font-bold font-mono tracking-tight select-all'>#{order.id}</p>
                                    <p className='text-[10px] text-muted-foreground'>
                                        {order.userName} • {formatPhone(order.userPhone)}
                                    </p>
                                    <span className='text-muted-foreground text-[9px]'>
                                        {formatDateTime(order.createdAt)}
                                    </span>
                                </div>
                                {getPaymentStatusBadge(order.paid || 0, order.totalAmount)}
                            </div>
                        </CardHeader>
                        <CardBody className='py-0'>
                            <div className='bg-default/20 flex items-center gap-4 rounded-xl border p-1'>
                                <div className='size-24 shrink-0 border rounded-lg bg-background'>
                                    <Image
                                        src={
                                            `${bucketUrl(order.products?.[0]?.image || '')}` || `${fallback.order}`
                                        }
                                        alt={order.products?.[0]?.name || 'Product'}
                                        className='size-full aspect-square rounded-lg object-cover'
                                        removeWrapper
                                    />
                                </div>
                                <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                                    <p className='line-clamp-2 font-bold leading-tight'>
                                        {order.products?.[0]?.name || 'Unknown Product'}
                                    </p>
                                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                        <span className='font-semibold'>
                                            Qty: {order.products?.reduce((acc, p) => acc + (p.quantity || 0), 0) || 0}
                                        </span>
                                        {order.products?.[0]?.category && (
                                            <>
                                                <span>•</span>
                                                <span className='truncate'>{order.products?.[0]?.category}</span>
                                            </>
                                        )}
                                        {order.products?.[0]?.storage && (
                                            <>
                                                <span>•</span>
                                                <span>{order.products?.[0]?.storage}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                        <CardFooter className='gap-2'>
                            <Button
                                fullWidth
                                className='text-white'
                                color='warning'
                                size='sm'
                                onPress={() => openReturn(order)}
                            >
                                Return
                            </Button>
                            <Button fullWidth color='primary' size='sm' onPress={() => openDetails(order)}>
                                Details
                            </Button>
                        </CardFooter>
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
            {Array.from({ length: count }).map((_, i) => (
                <Card
                    key={i}
                    className={cn(
                        'border bg-transparent shadow-none'
                    )}
                >
                    <CardHeader className='flex-row justify-between items-center'>
                        <div className='flex flex-col items-center gap-1'>
                            <Skeleton className='h-4 w-32 rounded-xl' />
                            <Skeleton className='h-2 w-20 rounded-xl' />
                        </div>

                        <Skeleton className='h-5 w-24 rounded-xl' />
                    </CardHeader>
                    <CardBody className='py-0'>
                        <div className='bg-default/20 flex items-center gap-4 rounded-xl border p-1'>
                            <Skeleton className='size-24 shrink-0 rounded-xl' />
                            <div className='flex min-w-0 flex-1 flex-col gap-2'>
                                <Skeleton className='h-4 w-full rounded-xl' />
                                <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                    <Skeleton className='h-4 w-1/2 rounded-xl' />
                                    <Skeleton className='h-4 w-1/2 rounded-xl' />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter className='gap-2'>
                        <Skeleton className='h-6 w-full rounded-md' />
                        <Skeleton className='h-6 rounded-md w-full' />

                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}