'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Skeleton } from '@heroui/react'

import { Icon } from '@/lib'

interface Transaction {
    id: string
    amount: number
    type: 'credit' | 'debit'
    note: string
    notes: string | null
    mode?: string | null
    origin_type?: string | null
    origin_qty?: number | null
    createdAt: string
    orderID: string
    order: {
        id: string
        mode: string | null
        note: string | null
        paid: number
        products: Products[]
    }
}

export type Products = {
    id: string
    name: string
    category: string
    price: number
    quantity: number
    is_fully_returned: boolean
    returned_quantity: number
}

function getIcon(note?: string | null) {
    switch (note) {
        case 'Product returned':
            return 'mdi:reply'
        case 'Order Created':
            return 'mdi:package-variant-closed'
        case 'Payment Received':
        case 'Payment Updated':
        case 'Amount Received':
            return 'mdi:check-circle-outline'
        case 'Order Refund':
            return 'mdi:cash-refund'
        default:
            return 'mdi:credit-card-outline'
    }
}

function formatTimestamp(dateString: string) {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    return `${day} ${month} ${year} • ${time}`
}
function maskId(id: string) {
    if (id.length <= 4) return id
    const lastDigits = id.slice(-4)

    return `XXXX-${lastDigits}`
}

export function TransactionCard({ transactions }: { transactions?: Transaction[] }) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <div className='space-y-2'>
            {transactions?.map((t) => {
                const isExpanded = expandedId === t.id

                return (
                    <div
                        key={t.id}
                        className={`flex flex-col gap-0.5 ${t.type === 'debit' ? 'items-end justify-end' : 'items-start justify-start'}`}
                    >
                        <div
                            aria-expanded={isExpanded}
                            className='overflow-hidden rounded-lg border'
                            role='button'
                            tabIndex={0}
                            onClick={() => toggleExpand(t.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleExpand(t.id)
                                }
                            }}
                        >
                            <div className='p-2'>
                                <div className='flex items-center justify-between gap-2'>
                                    <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                                        <div
                                            className={`bg-default/20 flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm`}
                                        >
                                            <Icon
                                                className={
                                                    t.type === 'debit'
                                                        ? 'text-red-700'
                                                        : 'text-green-700'
                                                }
                                                icon={getIcon(t.note)}
                                            />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate text-xs font-semibold tracking-tight'>
                                                {t.note || 'Transaction'}
                                            </p>
                                            <p className='truncate text-xs'>
                                                <span className='font-mono'>Trans ID:</span>
                                                <span className='text-muted-foreground'>
                                                    {maskId(t.id)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex shrink-0'>
                                        <p
                                            className={`text-base font-bold ${
                                                t.type === 'debit'
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}
                                        >
                                            {t.type === 'debit' ? '−' : '+'}
                                            {formatPrice(t.amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className='flex flex-wrap items-center gap-1'>
                                    {t.orderID && (
                                        <p className='truncate text-xs'>
                                            <span className='font-mono'>Order ID:</span>
                                            <span className='text-muted-foreground'>
                                                {maskId(t.orderID)}
                                            </span>
                                        </p>
                                    )}
                                    {t.notes && (
                                        <span className='text-xs font-medium uppercase'>
                                            {t.notes}
                                        </span>
                                    )}
                                    {t.origin_qty && (
                                        <span className='rounded px-1.5 py-0.5 text-xs font-medium'>
                                            Qty: {t.origin_qty}
                                        </span>
                                    )}
                                    {t.mode && (
                                        <span className='bg-default/20 ml-auto rounded px-1.5 py-0.5 text-xs font-medium uppercase'>
                                            {t.mode}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <AnimatePresence initial={false}>
                                {isExpanded && t.order?.products?.length > 0 && (
                                    <motion.div
                                        key='expand'
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className='border-t text-xs'
                                        exit={{ height: 0, opacity: 0 }}
                                        initial={{ height: 0, opacity: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 120,
                                            damping: 18,
                                        }}
                                    >
                                        <div className='text-muted-foreground border-b text-[11px] font-medium'>
                                            <div className='grid grid-cols-[1.4fr_1fr_0.8fr_0.2fr] items-center px-2 py-1.5 text-center'>
                                                <span className='text-start'>Product</span>
                                                <span>Category</span>
                                                <span>Price</span>
                                                <span className='text-end'>Qty</span>
                                            </div>
                                        </div>

                                        <div className='divide-y'>
                                            {t.order.products.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className='grid grid-cols-[1.4fr_1fr_0.8fr_0.2fr] items-center px-2 py-1 text-[10.5px]'
                                                >
                                                    <span className='truncate text-start'>
                                                        {p.name}
                                                    </span>
                                                    <span className='text-muted-foreground truncate text-center'>
                                                        {p.category || '-'}
                                                    </span>
                                                    <span className='text-center font-mono tabular-nums'>
                                                        {formatPrice(p.price)}
                                                    </span>
                                                    <span className='text-end font-mono tabular-nums'>
                                                        {p.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className='text-muted-foreground mx-1 text-xs'>
                            {formatTimestamp(t.createdAt)}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

export function TransactionSkeleton() {
    const numCards = 5

    const randomAlignments: ('start' | 'end')[] = Array.from({ length: numCards }, () =>
        Math.random() > 0.5 ? 'end' : 'start'
    )

    return (
        <div className='space-y-2'>
            {randomAlignments.map((align, idx) => (
                <div
                    key={idx}
                    className={`flex flex-col gap-0.5 ${
                        align === 'end' ? 'items-end justify-end' : 'items-start justify-start'
                    }`}
                >
                    <div className='overflow-hidden rounded-lg border p-2'>
                        <div className='flex items-center justify-between gap-2'>
                            <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                                <div className='bg-default/20 flex h-7 w-7 shrink-0 items-center justify-center rounded'>
                                    <Skeleton className='h-4 w-4 rounded' />
                                </div>
                                <div className='min-w-0 flex-1 space-y-1'>
                                    <Skeleton className='h-3 w-24 rounded' />
                                    <Skeleton className='h-2 w-32 rounded' />
                                </div>
                            </div>
                            <div className='flex shrink-0'>
                                <Skeleton className='h-4 w-16 rounded' />
                            </div>
                        </div>
                        <div className='mt-2 flex justify-between gap-1'>
                            <Skeleton className='h-3 w-20 rounded' />
                            <Skeleton className='h-3 w-14 rounded' />
                        </div>
                    </div>
                    <Skeleton className='mx-1 mt-1 h-2.5 w-20 rounded' />
                </div>
            ))}
        </div>
    )
}

export function NoTransactionMessage() {
    return (
        <div className='border-muted text-muted-foreground my-auto flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center'>
            <div className='bg-default/20 flex h-12 w-12 items-center justify-center rounded-full'>
                <Icon className='text-muted-foreground h-6 w-6' icon='mdi:cash-clock' />
            </div>
            <p className='text-sm font-medium'>No Transactions Yet</p>
            <p className='text-muted-foreground text-xs'>
                Once you start selling, your transactions will appear here.
            </p>
        </div>
    )
}
function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount)
}
