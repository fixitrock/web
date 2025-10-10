'use client'

import type { Product, ProductVariant } from '@/types/product'

import { useMemo, useState } from 'react'
import { TrashIcon } from 'lucide-react'

import { ScrollArea } from '@/ui/scroll-area'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { formatPrice } from '@/lib/utils'

export type CartItem = {
    id: string
    product: Product
    variant?: ProductVariant
    qty: number
}

type Props = {
    items: CartItem[]
    onInc: (id: string) => void
    onDec: (id: string) => void
    onRemove: (id: string) => void
    onClear: () => void
}

export function Cart({ items, onInc, onDec, onRemove, onClear }: Props) {
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')

    const subtotal = useMemo(
        () => items.reduce((sum, it) => sum + (it.variant?.price ?? it.product.price) * it.qty, 0),
        [items]
    )

    const taxRate = 0 // adjust as needed
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return (
        <aside className='flex h-full flex-col'>
            {/* Top: User Info */}
            <div className='space-y-3 p-4'>
                <div className='space-y-1'>
                    <label className='text-muted-foreground text-sm' htmlFor='customer-name'>
                        Customer name
                    </label>
                    <Input
                        className='bg-card'
                        id='customer-name'
                        placeholder='Enter name'
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>
                <div className='space-y-1'>
                    <label className='text-muted-foreground text-sm' htmlFor='customer-phone'>
                        Phone
                    </label>
                    <Input
                        className='bg-card'
                        id='customer-phone'
                        placeholder='Enter phone'
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                </div>
            </div>
            <Separator />

            <ScrollArea className='flex-1'>
                <div className='space-y-3 p-4'>
                    {items.length === 0 && (
                        <p className='text-muted-foreground text-center'>No items in cart.</p>
                    )}
                    {items.map((it) => (
                        <div
                            key={it.id}
                            aria-label={`${it.product.name} in cart`}
                            className='flex items-center gap-3 rounded-md border p-3'
                            role='listitem'
                        >
                            <div className='bg-muted h-12 w-12 overflow-hidden rounded'>
                                <img
                                    alt={`${it.product.name} image`}
                                    className='h-full w-full object-cover'
                                    src={
                                        it.variant?.img?.[0] ??
                                        it.product.img?.[0] ??
                                        '/placeholder.svg'
                                    }
                                />
                            </div>
                            <div className='flex-1'>
                                <div className='text-sm font-medium'>{it.product.name}</div>
                                <div className='text-muted-foreground flex flex-wrap gap-1 text-xs'>
                                    <span>{it.product.brand ?? '—'}</span>
                                    {it.variant?.color?.name ? (
                                        <span>• {it.variant.color.name}</span>
                                    ) : null}
                                    {it.variant?.storage ? (
                                        <span>• {it.variant.storage}</span>
                                    ) : it.product.storage ? (
                                        <span>• {it.product.storage}</span>
                                    ) : null}
                                </div>
                                <div className='text-sm'>
                                    {formatPrice(it.variant?.price ?? it.product.price)}
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    aria-label='Decrease quantity'
                                    size='icon'
                                    variant='secondary'
                                    onClick={() => onDec(it.id)}
                                >
                                    −
                                </Button>
                                <span className='w-6 text-center text-sm'>{it.qty}</span>
                                <Button
                                    aria-label='Increase quantity'
                                    size='icon'
                                    onClick={() => onInc(it.id)}
                                >
                                    +
                                </Button>
                            </div>
                            <Button
                                aria-label='Remove item'
                                size='icon'
                                variant='ghost'
                                onClick={() => onRemove(it.id)}
                            >
                                <TrashIcon />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <Separator />

            {/* Bottom: Totals */}
            <div className='space-y-3 p-4'>
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Tax</span>
                    <span>{formatPrice(tax)}</span>
                </div>
                <div className='flex items-center justify-between text-base font-semibold'>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <div className='flex gap-2 pt-2'>
                    <Button
                        aria-label='Checkout order'
                        className='flex-1'
                        disabled={items.length === 0}
                    >
                        Checkout
                    </Button>
                    <Button
                        aria-label='Clear cart'
                        disabled={items.length === 0}
                        variant='secondary'
                        onClick={onClear}
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </aside>
    )
}
