'use client'

import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'motion/react'
import { Minus, Package2, Plus, ScanBarcode, Trash } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, InputGroup, ScrollShadow, Tooltip, toast } from '@heroui/react'

import { cn } from '@/lib/utils'
import { useCartStore } from '@/zustand/store/cart'

import { Customer } from './customer'
import { OrderPlace } from './orderplace'

type Props = {
    className?: string
}

function CompactNumberField({
    value,
    prefix,
    placeholder,
    className,
    onChange,
}: {
    value: string
    prefix?: string
    placeholder?: string
    className?: string
    onChange: (value: string) => void
}) {
    return (
        <InputGroup className={className}>
            {prefix ? <InputGroup.Prefix>{prefix}</InputGroup.Prefix> : null}
            <InputGroup.Input
                inputMode='numeric'
                placeholder={placeholder}
                type='number'
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </InputGroup>
    )
}

export function PosCart({ className }: Props): React.ReactNode {
    const {
        items,
        updateQuantity,
        removeItem,
        updatePrice,
        getTotalItems,
        getTotalPrice,
        selectedCustomer,
        updateSerialNumber,
        addSerialNumber,
        removeSerialNumber,
    } = useCartStore()

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

    const handleQuantityChange = (id: string, newQuantity: number, maxQuantity: number) => {
        if (newQuantity > maxQuantity) {
            toast.warning(`Only ${maxQuantity} unit${maxQuantity > 1 ? 's are' : ' is'} available`)
            newQuantity = maxQuantity
        }

        if (newQuantity <= 0) {
            removeItem(id)
            return
        }

        updateQuantity(id, newQuantity)
    }

    const handlePriceChange = (id: string, newPrice: string) => {
        const price = parseFloat(newPrice) || 0

        if (price >= 0) {
            updatePrice(id, price)
        }
    }

    const toggleAccordionItem = (id: string) => {
        setExpandedItems((previous) => ({
            ...previous,
            [id]: !previous[id],
        }))
    }

    return (
        <section
            aria-label='Cart'
            className={cn(
                'border-default-200/70 bg-background flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-in-out',
                className
            )}
            data-slot='cart'
        >
            <div className='border-default-200/70 border-b px-3 py-2.5'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                            <div className='bg-default/10 text-default-700 flex h-9 w-9 items-center justify-center rounded-2xl'>
                                <Package2 size={17} />
                            </div>
                            <div className='min-w-0'>
                                <h2 className='line-clamp-1 text-base font-semibold tracking-tight'>
                                    {selectedCustomer ? `${selectedCustomer.name}'s Cart` : 'POS Cart'}
                                </h2>
                                <p className='text-muted-foreground line-clamp-1 text-xs'>
                                    {selectedCustomer
                                        ? selectedCustomer.phone.slice(2)
                                        : 'Search a customer to begin billing'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='border-default-200/70 bg-default/5 border-b p-3'>
                <Customer />
            </div>

            <ScrollShadow hideScrollBar className='flex-1 space-y-1.5 p-2'>
                {items.length === 0 ? (
                    <EmptyCartState />
                ) : (
                    items.map((item) => (
                        <Card key={item.id} className='relative rounded-lg border bg-transparent shadow-none'>
                            <Card.Content className='p-3'>
                                <div className='flex items-start justify-between gap-4'>
                                    <div className='flex-1'>
                                        <h3 className='text-md line-clamp-1 font-semibold'>{item.product.name}</h3>
                                        <div className='mt-1 flex flex-wrap items-center gap-2'>
                                            {item.selectedOptions.brand ? (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.brand}
                                                </span>
                                            ) : null}
                                            {item.product.category ? (
                                                <span className='rounded-sm border p-0.5 text-[10px]'>
                                                    {item.product.category}
                                                </span>
                                            ) : null}
                                            {item.selectedOptions.color ? (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.color}
                                                </span>
                                            ) : null}
                                            {item.selectedOptions.storage ? (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.storage}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <Button
                                        isIconOnly
                                        className='absolute top-2 right-2'
                                        size='sm'
                                        variant='danger'
                                        onPress={() => removeItem(item.id)}
                                    >
                                        <Trash size={14} />
                                    </Button>
                                </div>

                                <div className='mt-3 flex items-center justify-between gap-3'>
                                    <CompactNumberField
                                        className='max-w-24'
                                        placeholder={item.price.toString()}
                                        prefix='Rs'
                                        value={item.price.toString()}
                                        onChange={(value) => handlePriceChange(item.id, value)}
                                    />

                                    <div className='flex items-center gap-1.5'>
                                        <Tooltip>
                                            <Tooltip.Trigger>
                                                <Button
                                                    isIconOnly
                                                    className='bg-background mr-2 size-6 min-w-0 rounded-sm border'
                                                    size='sm'
                                                    variant='ghost'
                                                    onPress={() => toggleAccordionItem(item.id)}
                                                >
                                                    <ScanBarcode size={14} />
                                                </Button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>
                                                <p>Add IMEI/SN</p>
                                            </Tooltip.Content>
                                        </Tooltip>

                                        <Button
                                            isIconOnly
                                            className='bg-background size-6 min-w-0 rounded-sm border'
                                            size='sm'
                                            variant='ghost'
                                            onPress={() =>
                                                handleQuantityChange(item.id, item.quantity - 1, item.variant.quantity)
                                            }
                                        >
                                            <Minus size={14} />
                                        </Button>

                                        <CompactNumberField
                                            className='w-12 sm:w-14'
                                            value={item.quantity.toString()}
                                            onChange={(value) =>
                                                handleQuantityChange(
                                                    item.id,
                                                    parseInt(value, 10) || 0,
                                                    item.variant.quantity
                                                )
                                            }
                                        />

                                        <Button
                                            isDisabled={item.quantity >= item.variant.quantity}
                                            isIconOnly
                                            className='bg-background size-6 min-w-0 rounded-sm border'
                                            size='sm'
                                            variant='ghost'
                                            onPress={() =>
                                                handleQuantityChange(item.id, item.quantity + 1, item.variant.quantity)
                                            }
                                        >
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </Card.Content>

                            <AnimatePresence>
                                {expandedItems[item.id] ? (
                                    <motion.div
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className='overflow-hidden'
                                        exit={{ height: 0, opacity: 0 }}
                                        initial={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <Card.Footer className='p-3 pt-0'>
                                            <div className='w-full space-y-2'>
                                                {(item.serialNumbers || []).map((serial, index) => (
                                                    <motion.div
                                                        key={index}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className='flex w-full items-center gap-2'
                                                        exit={{ opacity: 0, y: -10 }}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <InputGroup className='bg-default/20'>
                                                            <InputGroup.Input
                                                                placeholder='IMEI / Serial No.'
                                                                value={serial}
                                                                onChange={(event) =>
                                                                    updateSerialNumber(
                                                                        item.id,
                                                                        index,
                                                                        event.target.value
                                                                    )
                                                                }
                                                            />
                                                        </InputGroup>

                                                        {index === item.serialNumbers.length - 1 ? (
                                                            <Button
                                                                isIconOnly
                                                                className='bg-background border'
                                                                size='sm'
                                                                variant='ghost'
                                                                onPress={() => addSerialNumber(item.id, '')}
                                                            >
                                                                <Plus size={14} />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                isIconOnly
                                                                className='border'
                                                                size='sm'
                                                                variant='danger'
                                                                onPress={() => removeSerialNumber(item.id, index)}
                                                            >
                                                                <Trash size={14} />
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </Card.Footer>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </Card>
                    ))
                )}
            </ScrollShadow>

            <div className='space-y-1.5 border-t p-2'>
                <div className='flex justify-between text-xs'>
                    <p>
                        <span className='text-muted-foreground'>Total Items </span>
                        <span className='font-medium'>{items.length}</span>
                    </p>
                    <p>
                        <span className='text-muted-foreground'>Total Quantity </span>
                        <span className='font-medium'>{getTotalItems()}</span>
                    </p>
                </div>
                <div className='via-default/30 my-1 h-px bg-linear-to-r from-transparent to-transparent' />
                <div className='flex items-center justify-between font-semibold'>
                    <p>Total Payment</p>
                    <NumberFlow
                        className='overflow-hidden'
                        format={{ style: 'currency', currency: 'INR' }}
                        value={getTotalPrice()}
                    />
                </div>
                <div className='flex flex-col-reverse items-center gap-2'>
                    <OrderPlace />
                </div>
            </div>
        </section>
    )
}

function EmptyCartState() {
    return (
        <div className='border-default-300 bg-default/5 flex h-full min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center'>
            <div className='bg-default/10 flex h-14 w-14 items-center justify-center rounded-2xl'>
                <Package2 className='text-default-500' size={24} />
            </div>
            <h3 className='mt-4 text-base font-semibold'>Cart is empty</h3>
            <p className='text-muted-foreground mt-1 max-w-56 text-sm'>
                Add products from the catalog to start building the order.
            </p>
        </div>
    )
}
