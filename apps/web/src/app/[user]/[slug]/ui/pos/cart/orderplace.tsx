'use client'

import React, { useCallback, useMemo } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, IndianRupee } from 'lucide-react'
import { Button, InputGroup, ScrollShadow, toast, useOverlayState } from '@heroui/react'

import { useOrder } from '@/hooks/tanstack/mutation'
import { useMediaQuery } from '@/hooks'
import { cn, formatPrice, logWarning } from '@/lib/utils'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/ui/drawer'
import { CreditCard, GooglePay, PrinterIcon, RupeeBag, WhatsAppIcon } from '@/ui/icons'
import { PaymentMethodType, useCartStore } from '@/zustand/store/cart'

export function OrderPlace() {
    const { isOpen, open, close, setOpen } = useOverlayState()
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const {
        getTotalItems,
        getTotalPrice,
        selectedCustomer,
        paidAmount,
        setPaidAmount,
        note,
        setNote,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        order,
        clearAll,
        selectedReceiptOption,
        setReceiptOption,
    } = useCartStore()
    const { addOrder } = useOrder()

    const displayAmount = useMemo(() => paidAmount || getTotalPrice(), [paidAmount, getTotalPrice])
    const isValidAmount = useMemo(
        () => displayAmount >= 0 && displayAmount <= getTotalPrice(),
        [displayAmount, getTotalPrice]
    )
    const customerName = useMemo(() => selectedCustomer?.name || 'Order Summary', [selectedCustomer])
    const customerPhone = useMemo(() => selectedCustomer?.phone || 'N/A', [selectedCustomer])

    const currentNote = selectedPaymentMethod ? note[selectedPaymentMethod as PaymentMethodType] || '' : ''

    const handleNoteChange = useCallback(
        (value: string) => {
            if (selectedPaymentMethod) {
                setNote(selectedPaymentMethod as PaymentMethodType, value)
            }
        },
        [selectedPaymentMethod, setNote]
    )

    const handlePlaceOrder = useCallback(async () => {
        if (!selectedCustomer?.id || !selectedPaymentMethod) {
            toast.danger('Error', {
                description: 'Please select a customer and payment method',
            })
            return
        }

        const orderData = order()
        if (!orderData) {
            toast.danger('Error', {
                description: 'Unable to create order data',
            })
            return
        }

        try {
            const result = await addOrder.mutateAsync(orderData)

            if (!result.success || !result.orderId) {
                throw new Error('Order creation failed')
            }

            const last4Digits = result.orderId.slice(-4).toUpperCase()
            const now = new Date()
            const message = [
                '*ORDER RECEIPT*',
                `Invoice: #${last4Digits}`,
                now.toLocaleString('en-IN'),
                '',
                '*Products*',
                ...orderData.products.map((product) => {
                    const details = [product.brand, product.category, product.color?.name, product.storage]
                        .filter(Boolean)
                        .join(' / ')
                    const total = product.total ?? product.price * product.quantity

                    return [
                        `- *${product.name}*`,
                        details ? `  _${details}_` : null,
                        `  ${product.quantity} x ${formatPrice(product.price)} = *${formatPrice(total)}*`,
                    ]
                        .filter(Boolean)
                        .join('\n')
                }),
                '',
                `*Total:* *${formatPrice(orderData.totalAmount)}*`,
                `*Payment:* ${selectedPaymentMethod.toUpperCase()}`,
                '_Thank you for your purchase!_',
            ]
                .filter(Boolean)
                .join('\n')

            const phone = selectedCustomer.phone.replace(/\D/g, '')
            const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`

            toast.success(`Order #${last4Digits}`, {
                description: `Send receipt to ${selectedCustomer.name}`,
            })

            if (selectedReceiptOption === 'whatsapp') {
                setTimeout(() => {
                    openWhatsApp(whatsappUrl)
                }, 2000)
            }

            clearAll()
            close()
        } catch (error) {
            logWarning('Error creating order:', error)
            toast.danger('Error', {
                description: error instanceof Error ? error.message : 'Failed to create order',
            })
        }
    }, [
        addOrder,
        clearAll,
        close,
        order,
        selectedCustomer,
        selectedPaymentMethod,
        selectedReceiptOption,
    ])

    const isPlaceOrderDisabled = useMemo(
        () =>
            getTotalItems() === 0 ||
            !selectedCustomer?.id ||
            !selectedPaymentMethod ||
            !isValidAmount ||
            addOrder.isPending,
        [addOrder.isPending, getTotalItems, isValidAmount, selectedCustomer, selectedPaymentMethod]
    )

    const placeOrderButtonText = useMemo(() => {
        if (addOrder.isPending) return 'Processing...'
        if (selectedPaymentMethod === 'paylater') return 'Complete Order'

        return `Pay ${formatPrice(displayAmount)}`
    }, [addOrder.isPending, displayAmount, selectedPaymentMethod])

    return (
        <>
            <Button
                fullWidth
                aria-label='Place Order'
                isDisabled={getTotalItems() === 0 || !selectedCustomer?.id}
                size='sm'
                variant='primary'
                onPress={open}
            >
                Place Order
            </Button>

            <Drawer direction={isDesktop ? 'right' : 'bottom'} open={isOpen} onOpenChange={setOpen}>
                <DrawerContent className='h-[90vh] md:h-full' hideCloseButton={isDesktop} showbar={!isDesktop}>
                    <DrawerHeader className='border-b p-3'>
                        <DrawerTitle className='text-lg'>{customerName}</DrawerTitle>
                        <DrawerDescription className='text-xs'>{customerPhone}</DrawerDescription>
                    </DrawerHeader>

                    <ScrollShadow hideScrollBar>
                        <div className='flex flex-col gap-4 p-3'>
                            <div className='border-default-300 bg-default/5 rounded-lg border border-dashed p-3'>
                                <div className='mb-1 flex items-center justify-between'>
                                    <h3 className='text-foreground text-sm font-semibold'>Order Summary</h3>
                                    <p className='text-foreground text-sm'>{getTotalItems()} items</p>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Total Amount</span>
                                    <span className='text-foreground flex items-center text-lg font-bold'>
                                        <IndianRupee className='h-4 w-4' />
                                        {getTotalPrice().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className='mb-2 text-sm font-semibold'>Payment Method</h3>
                                <div className='space-y-2'>
                                    <PaymentMethod
                                        description='Cash payment from customer'
                                        icon={<RupeeBag className='size-10' />}
                                        isSelected={selectedPaymentMethod === 'cash'}
                                        title='Cash'
                                        value='cash'
                                        onClick={() => {
                                            setSelectedPaymentMethod('cash')
                                            setPaidAmount(0)
                                        }}
                                    />
                                    <PaymentMethod
                                        description='Scan QR code or use UPI ID'
                                        icon={<GooglePay className='size-10' />}
                                        inputField={
                                            <InputGroup className='bg-default/20'>
                                                <InputGroup.Input
                                                    placeholder='mobile@upi'
                                                    value={currentNote}
                                                    onChange={(event) => handleNoteChange(event.target.value)}
                                                />
                                            </InputGroup>
                                        }
                                        isSelected={selectedPaymentMethod === 'upi'}
                                        showInput={selectedPaymentMethod === 'upi'}
                                        title='UPI'
                                        value='upi'
                                        onClick={() => {
                                            setSelectedPaymentMethod('upi')
                                            setPaidAmount(getTotalPrice())
                                        }}
                                    />
                                    <PaymentMethod
                                        description='Credit or debit card payment'
                                        icon={<CreditCard className='size-10' />}
                                        inputField={
                                            <InputGroup className='bg-default/20'>
                                                <InputGroup.Input
                                                    placeholder='1234 5678 9012 3456'
                                                    value={currentNote}
                                                    onChange={(event) => handleNoteChange(event.target.value)}
                                                />
                                            </InputGroup>
                                        }
                                        isSelected={selectedPaymentMethod === 'card'}
                                        showInput={selectedPaymentMethod === 'card'}
                                        title='Card'
                                        value='card'
                                        onClick={() => {
                                            setSelectedPaymentMethod('card')
                                            setPaidAmount(getTotalPrice())
                                        }}
                                    />
                                    <PaymentMethod
                                        description='Customer will pay later'
                                        isSelected={selectedPaymentMethod === 'paylater'}
                                        title='Pay Later'
                                        value='paylater'
                                        onClick={() => {
                                            setSelectedPaymentMethod('paylater')
                                            setPaidAmount(0)
                                        }}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedPaymentMethod === 'cash' ? (
                                    <motion.div
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className='overflow-hidden'
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <InputGroup className='bg-default/20'>
                                            <InputGroup.Prefix>
                                                <IndianRupee className='h-4 w-4' />
                                            </InputGroup.Prefix>
                                            <InputGroup.Input
                                                inputMode='numeric'
                                                placeholder='Enter amount'
                                                type='number'
                                                value={paidAmount?.toString() || '0'}
                                                onChange={(event) => {
                                                    const amount = parseFloat(event.target.value) || 0
                                                    setPaidAmount(amount)
                                                }}
                                            />
                                        </InputGroup>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            <div>
                                <h3 className='mb-2 text-sm font-semibold'>Do you want Receipt?</h3>
                                <div className='grid grid-cols-2 gap-2'>
                                    <ReceiptOption
                                        icon={<PrinterIcon />}
                                        isSelected={selectedReceiptOption === 'print'}
                                        title='Print'
                                        onClick={() => setReceiptOption('print')}
                                    />
                                    <ReceiptOption
                                        icon={<WhatsAppIcon />}
                                        isSelected={selectedReceiptOption === 'whatsapp'}
                                        title='WhatsApp'
                                        onClick={() => setReceiptOption('whatsapp')}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollShadow>

                    <DrawerFooter className='border-t p-3'>
                        <Button
                            isDisabled={isPlaceOrderDisabled}
                            isPending={addOrder.isPending}
                            variant='primary'
                            onPress={handlePlaceOrder}
                        >
                            {placeOrderButtonText}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

const PaymentMethod = ({
    title,
    icon,
    value,
    isSelected,
    onClick,
    description,
    showInput,
    inputField,
}: {
    title: string
    icon?: React.ReactNode
    value: PaymentMethodType
    isSelected: boolean
    onClick: () => void
    description?: string
    showInput?: boolean
    inputField?: React.ReactNode
}) => {
    return (
        <button
            aria-pressed={isSelected}
            className={cn(
                'bg-default/20 hover:bg-default/30 flex w-full flex-col rounded-lg p-3 text-left shadow-none transition-colors',
                isSelected && 'bg-default/30'
            )}
            type='button'
            onClick={onClick}
        >
            <div className='flex items-center gap-3'>
                <div
                    aria-hidden='true'
                    className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        isSelected
                            ? value === 'paylater'
                                ? 'border-danger bg-danger'
                                : 'border-yellow-500 bg-yellow-500'
                            : 'border-default-400'
                    )}
                >
                    {isSelected ? <Check aria-hidden='true' className='h-3 w-3 text-white' /> : null}
                </div>

                <div className='flex-1 text-start'>
                    <h3 className='text-sm font-medium'>{title}</h3>
                    {description ? <p className='text-muted-foreground text-xs'>{description}</p> : null}
                </div>

                {icon}
            </div>

            <AnimatePresence>
                {showInput && inputField ? (
                    <motion.div
                        animate={{ opacity: 1, height: 'auto' }}
                        className='mt-2 overflow-hidden'
                        exit={{ opacity: 0, height: 0 }}
                        initial={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {inputField}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </button>
    )
}

const ReceiptOption = ({
    icon,
    title,
    isSelected,
    onClick,
}: {
    icon: React.ReactNode
    title: string
    isSelected: boolean
    onClick: () => void
}) => {
    return (
        <button
            aria-pressed={isSelected}
            className={cn(
                'bg-default/10 flex flex-col items-center justify-center rounded-lg p-3 transition-colors',
                isSelected && 'bg-primary/20'
            )}
            type='button'
            onClick={onClick}
        >
            <div aria-hidden='true' className='mb-1 flex h-8 w-8 items-center justify-center rounded-md'>
                {icon}
            </div>
            <span className='text-xs font-medium'>{title}</span>
        </button>
    )
}

function openWhatsApp(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
}
