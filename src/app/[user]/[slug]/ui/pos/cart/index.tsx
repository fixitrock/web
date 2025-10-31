'use client'
import { Minus, Plus, ReceiptIndianRupee, ScanBarcode, Trash } from 'lucide-react'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Input,
    ScrollShadow,
    addToast,
    Tooltip,
} from '@heroui/react'
import NumberFlow from '@number-flow/react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useCartStore } from '@/zustand/store/cart'

import { Customer } from './customer'
import { OrderPlace } from './orderplace'
import { UserTransaction } from './transaction'

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
        // clearAll,
    } = useCartStore()

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

    const handleQuantityChange = (id: string, newQuantity: number, maxQuantity: number) => {
        if (newQuantity > maxQuantity) {
            addToast({
                title: `Oh bhai! ${maxQuantity} hi hain! 😮`,
                color: 'warning',
            })
            newQuantity = maxQuantity
        }

        if (newQuantity <= 0) {
            removeItem(id)
        } else {
            updateQuantity(id, newQuantity)
        }
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
            className='hidden rounded-lg border sm:flex sm:w-96 sm:flex-col'
            data-slot='cart'
        >
            <div className='flex items-center justify-between p-2'>
                <Button
                    isIconOnly
                    aria-label='User Transactions History'
                    className='bg-default/20'
                    data-slot='user-transaction-button'
                    radius='full'
                    size='sm'
                    startContent={<ReceiptIndianRupee size={20} />}
                    variant='light'
                />

                <div className='flex flex-col items-center'>
                    <h2 className='line-clamp-1 text-lg font-semibold'>
                        {selectedCustomer ? `${selectedCustomer.name}'s Order` : 'Order'}
                    </h2>
                    <p className='text-muted-foreground text-xs'>
                        {selectedCustomer ? selectedCustomer.phone.slice(2) : ''}
                    </p>
                </div>
                <UserTransaction />
            </div>

            <div className='border-b p-2'>
                <Customer />
            </div>

            <ScrollShadow hideScrollBar className='flex-1 space-y-1.5 p-2'>
                {items.length === 0 ? (
                    <div className='flex h-full items-center justify-center'>
                        <p className='text-muted-foreground'>Cart is empty</p>
                    </div>
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
                    {/* <Button
                        fullWidth
                        aria-label='Clear Cart'
                        className='border-danger border'
                        color='danger'
                        radius='full'
                        size='sm'
                        variant='light'
                        onPress={clearAll}
                    >
                        Clear Cart
                    </Button> */}
                </div>
            </div>
        </section>
    )
}
