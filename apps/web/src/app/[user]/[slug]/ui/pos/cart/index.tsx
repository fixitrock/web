'use client'
import { Minus, Package2, Plus, ScanBarcode, Trash } from 'lucide-react'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Input,
    ScrollShadow,
    Tooltip,
    addToast,
} from '@heroui/react'
import NumberFlow from '@number-flow/react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useCartStore } from '@/zustand/store/cart'

import { Customer } from './customer'
import { OrderPlace } from './orderplace'

export function PosCart() {
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
            addToast({
                title: `Only ${maxQuantity} unit${maxQuantity > 1 ? 's are' : ' is'} available`,
                color: 'warning',
            })
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
        setExpandedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    return (
        <section
            aria-label='Cart'
            className='flex h-full w-full flex-col overflow-hidden rounded-2xl border border-default-200/70 bg-background'
            data-slot='cart'
        >
            <div className='border-b border-default-200/70 px-3 py-2.5'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                            <div className='flex h-9 w-9 items-center justify-center rounded-2xl bg-default/10 text-default-700'>
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

            <div className='border-b border-default-200/70 bg-default/5 p-3'>
                <Customer />
            </div>

            <ScrollShadow hideScrollBar className='flex-1 space-y-1.5 p-2'>
                {items.length === 0 ? (
                    <EmptyCartState />
                ) : (
                   items.map((item) => (
                        <Card
                            key={item.id}
                            className='relative rounded-lg border bg-transparent shadow-none'
                        >
                            <CardBody className='p-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <h3 className='text-md line-clamp-1 font-semibold'>
                                            {item.product.name}
                                        </h3>
                                        <div className='mt-1 flex items-center gap-2'>
                                            {item.selectedOptions.brand && (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.brand}
                                                </span>
                                            )}
                                            {item.product.category && (
                                                <span className='rounded-sm border p-0.5 text-[10px]'>
                                                    {item.product.category}
                                                </span>
                                            )}
                                            {item.selectedOptions.color && (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.color}
                                                </span>
                                            )}
                                            {item.selectedOptions.storage && (
                                                <span className='rounded-sm border px-1 py-0.5 text-[10px]'>
                                                    {item.selectedOptions.storage}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-3 flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Input
                                            className='max-w-24 min-w-auto'
                                            classNames={{
                                                inputWrapper:
                                                    'h-6 min-h-6 rounded bg-transparent shadow-none group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent',
                                            }}
                                            placeholder={item.price.toString()}
                                            size='sm'
                                            startContent='₹'
                                            type='number'
                                            value={item.price.toString()}
                                            onValueChange={(value) =>
                                                handlePriceChange(item.id, value)
                                            }
                                        />
                                    </div>

                                    <div className='flex items-center gap-1.5'>
                                        <Tooltip
                                            content='Add IMEI/SN'
                                            color='foreground'
                                            size='sm'
                                            className='border'
                                            shadow='none'
                                        >
                                            <Button
                                                isIconOnly
                                                className='bg-background mr-2 size-6 min-w-auto rounded-sm border'
                                                size='sm'
                                                startContent={<ScanBarcode size={14} />}
                                                variant='light'
                                                onPress={() => toggleAccordionItem(item.id)}
                                            />
                                        </Tooltip>

                                        <Button
                                            isIconOnly
                                            className='bg-background size-6 min-w-auto rounded-sm border'
                                            size='sm'
                                            startContent={<Minus size={14} />}
                                            variant='light'
                                            onPress={() =>
                                                handleQuantityChange(
                                                    item.id,
                                                    item.quantity - 1,
                                                    item.variant.quantity
                                                )
                                            }
                                        />

                                        <Input
                                            className='w-12 min-w-auto sm:w-14'
                                            classNames={{
                                                input: 'truncate overflow-hidden text-center',
                                                inputWrapper:
                                                    'bg-default/10 group-data-[focus=true]:bg-default/10 data-[hover=true]:bg-default/10 h-6 min-h-6 rounded',
                                            }}
                                            min={0}
                                            size='sm'
                                            type='number'
                                            value={item.quantity.toString()}
                                            onValueChange={(value) =>
                                                handleQuantityChange(
                                                    item.id,
                                                    parseInt(value) || 0,
                                                    item.variant.quantity
                                                )
                                            }
                                        />

                                        <Button
                                            isIconOnly
                                            className='bg-background size-6 min-w-auto rounded-sm border'
                                            isDisabled={item.quantity >= item.variant.quantity}
                                            size='sm'
                                            startContent={<Plus size={14} />}
                                            variant='light'
                                            onPress={() =>
                                                handleQuantityChange(
                                                    item.id,
                                                    item.quantity + 1,
                                                    item.variant.quantity
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardBody>

                            <AnimatePresence>
                                {expandedItems[item.id] && (
                                    <motion.div
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className='overflow-hidden'
                                        exit={{ height: 0, opacity: 0 }}
                                        initial={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <CardFooter className='p-3 pt-0'>
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
                                                        <Input
                                                            classNames={{
                                                                inputWrapper:
                                                                    'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                                            }}
                                                            placeholder='IMEI / Serial No.'
                                                            size='sm'
                                                            value={serial}
                                                            onValueChange={(value) =>
                                                                updateSerialNumber(
                                                                    item.id,
                                                                    index,
                                                                    value
                                                                )
                                                            }
                                                        />

                                                        {index === item.serialNumbers.length - 1 ? (
                                                            <Button
                                                                isIconOnly
                                                                className='bg-background border'
                                                                size='sm'
                                                                startContent={<Plus size={14} />}
                                                                variant='light'
                                                                onPress={() =>
                                                                    addSerialNumber(item.id, '')
                                                                }
                                                            />
                                                        ) : (
                                                            <Button
                                                                isIconOnly
                                                                className='border'
                                                                color='danger'
                                                                size='sm'
                                                                startContent={<Trash size={14} />}
                                                                variant='light'
                                                                onPress={() =>
                                                                    removeSerialNumber(
                                                                        item.id,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardFooter>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                isIconOnly
                                className='absolute top-2 right-2'
                                color='danger'
                                size='sm'
                                startContent={<Trash size={14} />}
                                variant='light'
                                onPress={() => removeItem(item.id)}
                            />
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
        <div className='flex h-full min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-default-300 bg-default/5 px-6 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-default/10'>
                <Package2 className='text-default-500' size={24} />
            </div>
            <h3 className='mt-4 text-base font-semibold'>Cart is empty</h3>
            <p className='text-muted-foreground mt-1 max-w-56 text-sm'>
                Add products from the catalog to start building the order.
            </p>
        </div>
    )
}
