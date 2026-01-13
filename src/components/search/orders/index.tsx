'use client'

import { Package, Printer, Share2, Download, RotateCcw } from 'lucide-react'
import { Skeleton, Button, Divider } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from '@/ui/command'
import { useMyOrders } from '@/hooks/tanstack/query'
import { useSearchStore } from '@/zustand/store'
import { useDebounce } from '@/hooks'
import { formatPrice, formatPhone } from '@/lib/utils'
import { MyOrderItem } from '@/types/orders'

export function Orders() {
    const { query, expandedOrderId, setExpandedOrderId } = useSearchStore()
    const debouncedQuery = useDebounce(query)
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useMyOrders(debouncedQuery)

    const toggleExpand = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id)
    }

    const allOrders = data?.pages.flatMap((page) => page.orders) ?? []

    return (
        <CommandGroup heading='Order History'>
            {!isLoading && allOrders.length === 0 && (
                <CommandEmpty>
                    <div className='flex flex-col items-center justify-center p-6 text-center'>
                        <div className='bg-muted mb-3 rounded-full p-3'>
                            <Package className='text-muted-foreground size-6' />
                        </div>
                        <h3 className='text-sm font-medium'>No orders found</h3>
                        <p className='text-muted-foreground mt-1 max-w-[220px] text-xs'>
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
                        <Skeleton className='h-[38px] w-[56px] rounded-md' />
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
                                variant='flat'
                                radius='full'
                                onPress={() => fetchNextPage()}
                                isLoading={isFetchingNextPage}
                                className='bg-default/10 text-xs font-bold'
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
    const products = order.products ?? []
    const firstProduct = products[0]
    const extraCount = products.length > 1 ? products.length - 1 : 0

    return (
        <>
            <CommandItem value={order.id} onSelect={onToggle}>
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

                    <p className='text-muted-foreground truncate text-[10px]'>
                        {order.name}
                        {order.phone && ` • ${formatPhone(order.phone)}`}
                    </p>

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
                                {products.map((item, idx) => (
                                    <div key={idx} className='flex flex-col gap-1'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex flex-col'>
                                                <span className='text-xs font-semibold'>
                                                    {item.name}
                                                </span>
                                                <div className='flex items-center gap-2'>
                                                    {item.category && (
                                                        <span className='text-muted-foreground text-[10px]'>
                                                            {item.category}
                                                        </span>
                                                    )}
                                                    {item.returnedQuantity > 0 && (
                                                        <span className='text-danger flex items-center gap-0.5 text-[9px] leading-none font-bold uppercase'>
                                                            <RotateCcw className='size-2' />
                                                            {item.returnedQuantity} Returned
                                                        </span>
                                                    )}
                                                </div>
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
                                            <Divider className='bg-default/10' />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Divider & Total */}
                            <Divider className='bg-default-200' />
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
                                        variant='flat'
                                        radius='full'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                        startContent={<Printer className='size-4' />}
                                    />
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='flat'
                                        radius='full'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                        startContent={<Share2 className='size-4' />}
                                    />
                                    <Button
                                        size='sm'
                                        isIconOnly
                                        variant='flat'
                                        radius='full'
                                        className='bg-background size-7 min-w-0 shrink-0 border'
                                        startContent={<Download className='size-4' />}
                                    />
                                </div>
                                <Button
                                    size='sm'
                                    isIconOnly
                                    color='danger'
                                    variant='flat'
                                    radius='full'
                                    className='bg-background size-7 min-w-0 shrink-0 border'
                                    startContent={<RotateCcw className='size-4' />}
                                />
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
