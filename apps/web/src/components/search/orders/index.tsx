'use client'

import { Package, Printer, Share2, Download, RotateCcw } from 'lucide-react'
import { Skeleton, Button, Separator } from '@heroui/react'
import { Snippet } from '@heroui/snippet'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from '@/ui/command'
import { useMyOrders } from '@/hooks/tanstack/query'
import { useSearchStore } from '@/zustand/store'
import { useDebounce } from '@/hooks'
import { formatPrice, formatPhone } from '@/lib/utils'
import { MyOrderItem, Order } from '@/types/orders'
import { useOrderStore } from '@/zustand/store/orders'
import { ReturnOrder } from '@/app/[user]/[slug]/ui/orders/return'
import { useMemo } from 'react'

export function Orders() {
    const { query, expandedOrderId, setExpandedOrderId } = useSearchStore()
    const debouncedQuery = useDebounce(query)
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useMyOrders(debouncedQuery)

    const toggleExpand = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id)
    }

    const allOrders = useMemo(() => {
        const orders = data?.pages.flatMap((page) => page.orders) ?? []
        const seenIds = new Set<string>()

        return orders.filter((order) => {
            if (seenIds.has(order.id)) {
                return false
            }

            seenIds.add(order.id)
            return true
        })
    }, [data])

    return (
        <CommandGroup heading='Order History'>
            {!isLoading && allOrders.length === 0 && (
                <CommandEmpty>
                    <div className='flex flex-col items-center justify-center p-6 text-center'>
                        <div className='bg-muted mb-3 rounded-full p-3'>
                            <Package className='text-muted-foreground size-6' />
                        </div>
                        <h3 className='text-sm font-medium'>No orders found</h3>
                        <p className='text-muted-foreground mt-1 max-w-55 text-xs'>
                            {query
                                ? 'Try adjusting your search.'
                                : 'Orders will appear once you place or receive orders.'}
                        </p>
                    </div>
                </CommandEmpty>
            )}

            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <CommandItem key={i} value={`skeleton-${i}`}>
                        <Skeleton className='h-9.5 w-14 rounded-md' />
                        <div className='flex w-full flex-1 flex-col gap-1 truncate'>
                            <Skeleton className='h-4 w-32 rounded' />
                            <Skeleton className='h-3 w-24 rounded' />
                            <Skeleton className='h-2 w-20 rounded' />
                        </div>
                        <CommandShortcut>
                            <Skeleton className='h-6 w-12 rounded' />
                        </CommandShortcut>
                    </CommandItem>
                ))
            ) : (
                <div className='flex flex-col gap-1 px-1'>
                    {allOrders.map((order: MyOrderItem) => (
                        <ExpandableOrderItem
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrderId === order.id}
                            onToggle={() => toggleExpand(order.id)}
                        />
                    ))}

                    {hasNextPage && (
                        <div className='flex justify-center py-4'>
                            <Button
                                size='sm'
                                variant='tertiary'
                                onPress={() => fetchNextPage()}
                                isPending={isFetchingNextPage}
                                className='bg-default/10 rounded-full text-xs font-bold'
                            >
                                Load More Orders
                            </Button>
                        </div>
                    )}

                    {!hasNextPage && allOrders.length > 0 && (
                        <div className='py-6 text-center'>
                            <p className='text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-50'>
                                You've reached the end
                            </p>
                        </div>
                    )}
                </div>
            )}
            <ReturnOrder />
        </CommandGroup>
    )
}

function ExpandableOrderItem({
    order,
    isExpanded,
    onToggle,
}: {
    order: MyOrderItem
    isExpanded: boolean
    onToggle: () => void
}) {
    const { openReturn } = useOrderStore()

    const products = order.products ?? []
    const firstProduct = products[0]
    const extraCount = products.length > 1 ? products.length - 1 : 0

    return (
        <>
            <CommandItem key={order.id} value={order.id} onSelect={onToggle}>
                <div className='bg-default/5 rounded-md border border-dashed px-1.5 py-2'>
                    <span className='font-mono text-sm font-semibold'>#{order.id.slice(-4)}</span>
                </div>

                <div className='flex w-full flex-1 flex-col items-start truncate'>
                    <p className='truncate font-medium'>
                        {firstProduct?.name}
                        {extraCount > 0 && (
                            <span className='text-muted-foreground ml-2'>+{extraCount}</span>
                        )}
                    </p>

                    <div className='text-muted-foreground flex items-center gap-1 text-[10px]'>
                        <p className='min-w-0 truncate'>{order.name}</p> •
                        {order.phone && (
                            <Snippet
                                symbol=''
                                size='sm'
                                variant='flat'
                                codeString={formatPhone(order.phone)}
                                className='text-muted-foreground bg-transparent p-0 text-[10px]'
                            >
                                {formatPhone(order.phone)}
                            </Snippet>
                        )}
                    </div>

                    <span className='text-muted-foreground text-[9px]'>
                        {formatTimestamp(order.createdAt)}
                    </span>
                </div>

                <CommandShortcut className='flex text-lg font-semibold tracking-normal'>
                    {formatPrice(order.totalAmount)}
                </CommandShortcut>
            </CommandItem>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className='overflow-hidden'
                    >
                        <div className='flex flex-col gap-3 rounded-xl border p-3'>
                            {/* Products List */}
                            <div className='flex flex-col gap-2'>
                                {products.map((item, idx) => {
                                    const metadata = [
                                        item.brand,
                                        item.category,
                                        item.color?.name,
                                        item.storage,
                                    ].filter(
                                        (value): value is string =>
                                            typeof value === 'string' && value.length > 0
                                    )

                                    const metadataLabel = metadata.join(' \u2022 ')
                                    const identifier = getProductIdentifier(item.serial)

                                    return (
                                        <div key={idx} className='flex flex-col gap-1'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex flex-col'>
                                                    <span className='text-xs font-semibold'>
                                                        {item.name}
                                                    </span>
                                                    <div className='flex items-center gap-2'>
                                                        {metadataLabel && (
                                                            <span className='text-muted-foreground text-[10px]'>
                                                                {metadataLabel}
                                                            </span>
                                                        )}

                                                        {item.returnedQuantity > 0 && (
                                                            <span className='text-danger flex items-center gap-0.5 text-[9px] leading-none font-bold uppercase'>
                                                                <RotateCcw className='size-2' />
                                                                {item.returnedQuantity} Returned
                                                            </span>
                                                        )}
                                                    </div>
                                                    {identifier && (
                                                        <div className='bg-default/5 mt-1 inline-flex max-w-fit items-center gap-1 rounded-full border border-dashed px-2 py-0.5'>
                                                            <span className='text-muted-foreground text-[9px] font-semibold tracking-wider uppercase'>
                                                                {identifier.label}
                                                            </span>
                                                            <span className='text-default-700 font-mono text-[10px]'>
                                                                {maskIdentifier(identifier.value)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='flex items-center gap-3'>
                                                    <span className='text-muted-foreground text-[10px]'>
                                                        {item.quantity} × {formatPrice(item.price)}
                                                    </span>
                                                    <span className='text-xs font-bold'>
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                            {idx < products.length - 1 && (
                                                <Separator className='bg-default/10' />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Separator & Total */}
                            <Separator className='bg-default-200' />
                            <div className='flex items-center justify-between px-1'>
                                <span className='text-muted-foreground text-[10px] font-bold tracking-tighter uppercase'>
                                    Subtotal
                                </span>
                                <span className='text-primary text-sm font-extrabold'>
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>

                            {/* Actions Footer */}
                            <div className='border-default-200 mt-1 flex items-center justify-between gap-2 border-t border-dashed pt-3'>
                                <div className='flex gap-1.5 pb-1'>
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='tertiary'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                    >
                                        <Printer className='size-4' />
                                    </Button>
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='tertiary'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                    >
                                        <Share2 className='size-4' />
                                    </Button>
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='tertiary'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                    >
                                        <Download className='size-4' />
                                    </Button>
                                </div>
                                {order.canReturn && (
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='danger-soft'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                        onPress={() => openReturn(order as unknown as Order)}
                                    >
                                        <RotateCcw className='size-4' />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

function formatTimestamp(dateString: string) {
    const date = new Date(dateString)

    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

    return `${day} ${month} ${year} • ${time}`
}

function getProductIdentifier(serials?: string[]) {
    const rawIdentifier = serials?.find(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
    )

    if (!rawIdentifier) {
        return null
    }

    const compactValue = rawIdentifier.replace(/[\s-]/g, '')
    const isIMEI = /^\d{14,16}$/.test(compactValue)

    return {
        label: isIMEI ? 'IMEI' : 'Serial',
        value: rawIdentifier,
    }
}

function maskIdentifier(value: string) {
    const trimmedValue = value.trim()

    if (trimmedValue.length <= 1) {
        return trimmedValue
    }

    return `${'*'.repeat(trimmedValue.length - 1)}${trimmedValue.slice(-4)}`
}





