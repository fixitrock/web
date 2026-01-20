'use client'

import { Button, Input, useDisclosure, Card, ScrollShadow, addToast } from '@heroui/react'
import React, { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IndianRupee, Check } from 'lucide-react'

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/ui/drawer'
import { useMediaQuery } from '@/hooks'
import { cn, logWarning, formatPrice } from '@/lib/utils'
import { useCartStore, PaymentMethodType } from '@/zustand/store/cart'
import { CreditCard, GooglePay, PrinterIcon, RupeeBag, WhatsAppIcon } from '@/ui/icons'
import { useOrder } from '@/hooks/tanstack/mutation'

export function OrderPlace() {
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()
    const isDesktop = useMediaQuery('(min-width: 786px)')

    // Cart Store
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

    const customerName = useMemo(
        () => selectedCustomer?.name || 'Order Summary',
        [selectedCustomer]
    )
    const customerPhone = useMemo(() => selectedCustomer?.phone || 'N/A', [selectedCustomer])

    // Get current note based on selected payment method
    const currentNote = selectedPaymentMethod
        ? note[selectedPaymentMethod as PaymentMethodType] || ''
        : ''

    // Handle note change from input
    const handleNoteChange = useCallback(
        (value: string) => {
            if (selectedPaymentMethod) {
                setNote(selectedPaymentMethod as PaymentMethodType, value)
            }
        },
        [selectedPaymentMethod, setNote]
    )

    // Place Order
    const handlePlaceOrder = useCallback(async () => {
        if (!selectedCustomer || !selectedPaymentMethod) {
            addToast({
                title: 'Error',
                description: 'Please select a customer and payment method',
                color: 'danger',
            })
            return
        }

        const orderData = order()
        if (!orderData) {
            addToast({
                title: 'Error',
                description: 'Unable to create order data',
                color: 'danger',
            })
            return
        }

        try {
            const result = await addOrder.mutateAsync(orderData)

            if (!result.success || !result.orderId) {
                throw new Error('Order creation failed')
            }

            // Build WhatsApp message
            const last4Digits = result.orderId.slice(-4).toUpperCase()
            const now = new Date()

            // Robust symbols using Unicode escapes
            const sym = {
                greet: '\uD83D\uDE4F', // 🙏
                receipt: '\uD83E\uDDFE', // 🧾
                cart: '\uD83D\uDED2', // 🛒
                money: '\uD83D\uDCB0', // 💰
                card: '\uD83D\uDCB3', // 💳
            }

            const message = [
                `*${sym.greet} राधे राधे, राजन् ${sym.greet}*`,
                `*${sym.receipt} ORDER RECEIPT ${sym.receipt}*`,
                `Invoice: #${last4Digits}`,
                now.toLocaleString('en-IN'),
                ``,
                `*${sym.cart} Products ${sym.cart}*`,
                ...orderData.products.map((p) => {
                    const details = [p.brand, p.category, p.color?.name, p.storage]
                        .filter(Boolean)
                        .join(' / ')

                    const total = p.total ?? p.price * p.quantity

                    return [
                        `• *${p.name}*`,
                        details ? `  _${details}_` : null,
                        `  ${p.quantity} \u00D7 ${formatPrice(p.price)} = *${formatPrice(total)}*`,
                    ]
                        .filter(Boolean)
                        .join('\n')
                }),
                ``,
                `*${sym.money} Total:* *${formatPrice(orderData.totalAmount)}*`,
                `*${sym.card} Payment:* ${selectedPaymentMethod.toUpperCase()}`,
                `_Thank you for your purchase! ${sym.greet}_`,
            ].join('\n')

            const phone = selectedCustomer.phone.replace(/\D/g, '')
            const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`

            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`

            addToast({
                title: `Send Receipt #${last4Digits} to ${selectedCustomer.name}`,
                // endContent: (
                //     <Button
                //         size='sm'
                //         variant='light'
                //         className='border'
                //         onPress={() => {
                //             openWhatsApp(whatsappUrl)
                //         }}
                //     >
                //         Send
                //     </Button>
                // ),
                icon: <WhatsAppIcon />,
                color: 'success',
                shouldShowTimeoutProgress: true,
                timeout: 5000,
            })
            if (selectedReceiptOption === 'whatsapp') {
                openWhatsApp(whatsappUrl)
            }

            clearAll()
            onClose()
        } catch (error) {
            logWarning('Error creating order:', error)
            addToast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create order',
                color: 'danger',
            })
        }
    }, [selectedCustomer, selectedPaymentMethod, order, addOrder, clearAll, onClose])

    const isPlaceOrderDisabled = useMemo(
        () =>
            getTotalItems() === 0 ||
            !selectedCustomer ||
            !selectedPaymentMethod ||
            !isValidAmount ||
            addOrder.isPending,
        [getTotalItems, selectedCustomer, selectedPaymentMethod, isValidAmount, addOrder.isPending]
    )

    const placeOrderButtonText = useMemo(() => {
        if (addOrder.isPending) return 'Processing...'
        if (selectedPaymentMethod === 'paylater') return 'Complete Order'

        return `Pay ${formatPrice(displayAmount)}`
    }, [selectedPaymentMethod, displayAmount, addOrder.isPending])

    return (
        <>
            <Button
                fullWidth
                aria-label='Place Order'
                color='primary'
                isDisabled={getTotalItems() === 0 || !selectedCustomer}
                radius='full'
                size='sm'
                onPress={onOpen}
            >
                Place Order
            </Button>

            <Drawer
                direction={isDesktop ? 'right' : 'bottom'}
                open={isOpen}
                onOpenChange={onOpenChange}
            >
                <DrawerContent
                    className='h-[90vh] md:h-full'
                    hideCloseButton={isDesktop}
                    showbar={!isDesktop}
                >
                    <DrawerHeader className='border-b p-3'>
                        <DrawerTitle className='text-lg'>{customerName}</DrawerTitle>
                        <DrawerDescription className='text-xs'>{customerPhone}</DrawerDescription>
                    </DrawerHeader>

                    <ScrollShadow hideScrollBar>
                        <div className='flex flex-col gap-4 p-3'>
                            {/* Order Summary */}
                            <div className='border-default-300 bg-default/5 rounded-lg border border-dashed p-3'>
                                <div className='mb-1 flex items-center justify-between'>
                                    <h3 className='text-foreground text-sm font-semibold'>
                                        Order Summary
                                    </h3>
                                    <p className='text-foreground text-sm'>
                                        {getTotalItems()} items
                                    </p>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>
                                        Total Amount
                                    </span>
                                    <span className='text-foreground flex items-center text-lg font-bold'>
                                        <IndianRupee className='h-4 w-4' />
                                        {getTotalPrice().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
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
                                            setPaidAmount(0) // fix: default 0
                                        }}
                                    />
                                    <PaymentMethod
                                        description='Scan QR code or use UPI ID'
                                        icon={<GooglePay className='size-10' />}
                                        inputField={
                                            <Input
                                                classNames={{
                                                    description: 'text-start',
                                                    inputWrapper:
                                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                                }}
                                                description='Enter your UPI ID for payment'
                                                label='UPI ID'
                                                labelPlacement='outside'
                                                placeholder='mobile@upi'
                                                size='sm'
                                                value={currentNote}
                                                onValueChange={handleNoteChange}
                                            />
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
                                            <Input
                                                classNames={{
                                                    description: 'text-start',
                                                    inputWrapper:
                                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                                }}
                                                description='Card details are securely processed'
                                                label='Card Number'
                                                labelPlacement='outside'
                                                placeholder='1234 5678 9012 3456'
                                                size='sm'
                                                value={currentNote}
                                                onValueChange={handleNoteChange}
                                            />
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

                            {/* Custom Amount Input */}
                            <AnimatePresence>
                                {selectedPaymentMethod === 'cash' && (
                                    <motion.div
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className='overflow-hidden'
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Input
                                            classNames={{
                                                inputWrapper:
                                                    'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                            }}
                                            label='Amount Received'
                                            labelPlacement='outside'
                                            placeholder='Enter amount'
                                            startContent={<IndianRupee className='h-4 w-4' />}
                                            type='number'
                                            value={paidAmount?.toString() || '0'}
                                            onValueChange={(value) => {
                                                const amount = parseFloat(value) || 0

                                                setPaidAmount(amount)
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Receipt Options */}
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
                            color='primary'
                            isDisabled={isPlaceOrderDisabled}
                            isLoading={addOrder.isPending}
                            radius='full'
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

// Payment Method Component
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
        <Card
            fullWidth
            isPressable
            aria-pressed={isSelected}
            className={cn(
                'bg-default/20 hover:bg-default/30 rounded-lg p-3 shadow-none',
                'flex flex-col',
                isSelected && 'bg-default/30'
            )}
            onPress={onClick}
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
                    {isSelected && (
                        <Check
                            aria-hidden='true'
                            className={cn(
                                'h-3 w-3',
                                value === 'paylater' ? 'text-white' : 'text-white'
                            )}
                        />
                    )}
                </div>

                <div className='flex-1 text-start'>
                    <h3 className='text-sm font-medium'>{title}</h3>
                    {description && <p className='text-muted-foreground text-xs'>{description}</p>}
                </div>

                {icon}
            </div>

            <AnimatePresence>
                {showInput && inputField && (
                    <motion.div
                        animate={{ opacity: 1, height: 'auto' }}
                        className='mt-2 overflow-hidden'
                        exit={{ opacity: 0, height: 0 }}
                        initial={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {inputField}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}

// Receipt Option Component
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
        <Card
            fullWidth
            isPressable
            aria-pressed={isSelected}
            className={cn(
                'flex flex-col items-center justify-center rounded-lg p-3 shadow-none',
                'bg-default/10',
                isSelected && 'bg-primary/20'
            )}
            onPress={onClick}
        >
            <div
                aria-hidden='true'
                className={cn('mb-1 flex h-8 w-8 items-center justify-center rounded-md')}
            >
                {icon}
            </div>
            <span className='text-xs font-medium'>{title}</span>
        </Card>
    )
}

function openWhatsApp(url: string) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore (iOS)
        (window.navigator as any).standalone === true

    if (isMobile || isPWA) {
        // Mobile / PWA → must be same window
        window.location.href = url
    } else {
        // Desktop browser → open new tab
        window.open(url, '_blank', 'noopener,noreferrer')
    }
}
