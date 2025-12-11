'use client'

import { useState } from 'react'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalFooter,
    Image,
    Textarea,
} from '@heroui/react'
import { useOrderStore } from '@/zustand/store/orders'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerBody,
    DrawerFooter,
    DrawerClose,
} from '@/ui/drawer'
import { Label } from '@/ui/label'
import { Badge } from '@/ui/badge'
import { Alert, AlertDescription } from '@/ui/alert'
import { AlertCircle, Minus, Plus, RotateCcw } from 'lucide-react'
import { ReturnData } from '@/types/orders'
import { useReturnOrder } from '@/hooks/tanstack/mutation/order'
import { bucketUrl } from '@/supabase/bucket'
import { fallback } from '@/config/site'
import { inputWrapperStyle } from '@/config/style'

export function ReturnOrder() {
    const { selectedOrder, isReturnOpen, closeReturn } = useOrderStore()
    const isMobile = useIsMobile()
    const { mutate: processReturn, isPending } = useReturnOrder()

    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    const handleQuantityChange = (productId: string, delta: number, maxQty: number) => {
        setSelectedItems((prev) => {
            const newMap = new Map(prev)
            const current = newMap.get(productId) || 0
            const newValue = Math.max(0, Math.min(maxQty, current + delta))

            if (newValue === 0) {
                newMap.delete(productId)
            } else {
                newMap.set(productId, newValue)
            }

            return newMap
        })
        setError('')
    }

    const handleConfirm = () => {
        if (!selectedOrder) return

        if (selectedItems.size === 0) {
            setError('Please select at least one item to return')
            return
        }

        if (!reason.trim()) {
            setError('Please provide a reason for the return')
            return
        }

        const returnData: ReturnData = {
            orderId: selectedOrder.id!,
            items: Array.from(selectedItems.entries()).map(([productId, quantity]) => {
                const product = selectedOrder.products.find((p) => p.productID === productId)!
                return {
                    productId,
                    quantity,
                    maxQuantity: product.quantity - product.returnedQuantity,
                }
            }),
            reason: reason.trim(),
        }

        processReturn(returnData, {
            onSuccess: () => {
                handleClose()
            },
        })
    }

    const handleClose = () => {
        setSelectedItems(new Map())
        setReason('')
        setError('')
        closeReturn()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const calculateRefundAmount = () => {
        if (!selectedOrder) return 0

        return Array.from(selectedItems.entries()).reduce((sum, [productId, qty]) => {
            const product = selectedOrder.products.find((p) => p.productID === productId)
            return sum + (product ? product.price * qty : 0)
        }, 0)
    }

    if (!selectedOrder) return null

    const content = (
        <div className='space-y-6'>
            {/* Items Selection */}
            <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                    <Label className='text-foreground/80 text-sm font-medium'>Order Items</Label>
                    <span className='text-muted-foreground text-xs'>
                        Order ID: #{selectedOrder.id}
                    </span>
                </div>

                <div className='scrollbar-hide max-h-[50vh] space-y-3 overflow-y-auto pr-2'>
                    {selectedOrder.products.map((product) => {
                        const returnedQty = product.returnedQuantity || 0
                        const totalQty = product.quantity
                        const remainingQty = totalQty - returnedQty
                        const isFullyReturned = remainingQty === 0
                        const selectedQty = selectedItems.get(product.productID) || 0

                        return (
                            <div
                                key={product.productID}
                                className={`group relative flex flex-col gap-3 rounded-xl border p-3 transition-all duration-200 ${
                                    isFullyReturned
                                        ? 'bg-default/10 border-transparent opacity-80'
                                        : 'bg-default/20 border'
                                }`}
                            >
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex min-w-0 flex-1 items-start gap-3'>
                                        {/* Product Image Placeholder or Image */}
                                        <Image
                                            src={
                                                product.image
                                                    ? bucketUrl(product.image)
                                                    : fallback.order
                                            }
                                            alt={product.name}
                                            className='border-default-200 h-12 w-12 rounded-lg border object-cover'
                                            width={48}
                                            height={48}
                                        />
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-start justify-between gap-2'>
                                                <p
                                                    className={`truncate text-sm leading-tight font-medium ${isFullyReturned ? 'text-muted-foreground' : 'text-foreground'}`}
                                                >
                                                    {product.name}
                                                </p>
                                            </div>

                                            <div className='mt-1.5 flex flex-wrap gap-1.5'>
                                                {isFullyReturned ? (
                                                    <Badge
                                                        variant='secondary'
                                                        className='h-5 border-green-500/20 bg-green-500/10 px-1.5 text-[10px] text-green-600'
                                                    >
                                                        Returned
                                                    </Badge>
                                                ) : returnedQty > 0 ? (
                                                    <Badge
                                                        variant='secondary'
                                                        className='h-5 border-orange-500/20 bg-orange-500/10 px-1.5 text-[10px] text-orange-600'
                                                    >
                                                        Partially Returned
                                                    </Badge>
                                                ) : null}

                                                {product.brand && (
                                                    <Badge
                                                        variant='outline'
                                                        className='text-muted-foreground h-5 px-1.5 text-[10px]'
                                                    >
                                                        {product.brand}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className='text-muted-foreground mt-2 flex items-center gap-3 text-xs'>
                                                <span className='text-foreground/80 font-medium'>
                                                    {formatCurrency(product.price)}
                                                </span>
                                                <span className='bg-border h-1 w-1 rounded-full' />
                                                <span>Qty: {totalQty}</span>
                                                {returnedQty > 0 && (
                                                    <>
                                                        <span className='bg-border h-1 w-1 rounded-full' />
                                                        <span className='font-medium text-orange-600'>
                                                            Returned: {returnedQty}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    {!isFullyReturned && (
                                        <div className='flex flex-col items-end gap-1'>
                                            <div className='bg-background flex items-center gap-1 rounded-lg border p-0.5 shadow-sm'>
                                                <Button
                                                    size='sm'
                                                    variant='light'
                                                    isIconOnly
                                                    className='text-default-500 data-[hover=true]:bg-default-100 h-7 w-7'
                                                    onPress={() =>
                                                        handleQuantityChange(
                                                            product.productID,
                                                            -1,
                                                            remainingQty
                                                        )
                                                    }
                                                    isDisabled={selectedQty === 0}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className='w-8 text-center font-mono text-sm font-semibold tabular-nums'>
                                                    {selectedQty}
                                                </span>
                                                <Button
                                                    size='sm'
                                                    variant='light'
                                                    isIconOnly
                                                    className='text-default-500 data-[hover=true]:bg-default-100 h-7 w-7'
                                                    onPress={() =>
                                                        handleQuantityChange(
                                                            product.productID,
                                                            1,
                                                            remainingQty
                                                        )
                                                    }
                                                    isDisabled={selectedQty >= remainingQty}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                            <span className='text-muted-foreground px-1 text-[10px]'>
                                                Max: {remainingQty}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Return Reason */}
            <Textarea
                label='Return Reason'
                labelPlacement='outside-top'
                classNames={{
                    inputWrapper: inputWrapperStyle,
                }}
                isRequired
                id='reason'
                placeholder='Please provide a detailed reason for the return...'
                value={reason}
                onChange={(e) => {
                    setReason(e.target.value)
                }}
            />

            {/* Refund Amount Summary */}
            <div className='bg-muted/30 rounded-xl border p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600'>
                            <RotateCcw size={16} />
                        </div>
                        <span className='text-sm font-medium'>Total Refund Amount</span>
                    </div>
                    <span className='text-xl font-bold tracking-tight text-green-600'>
                        {formatCurrency(calculateRefundAmount())}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant='destructive' className='animate-in fade-in slide-in-from-top-1'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription className='text-xs font-medium'>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    )

    if (isMobile) {
        return (
            <Drawer open={isReturnOpen} onOpenChange={(open) => !open && handleClose()}>
                <DrawerContent>
                    <DrawerHeader className='border-b text-left'>
                        <DrawerTitle>Return Order</DrawerTitle>
                    </DrawerHeader>
                    <DrawerBody className='px-4'>{content}</DrawerBody>
                    <DrawerFooter className='border-t pt-4'>
                        <Button
                            color='warning'
                            className='shadow-warning/20 font-medium shadow-lg'
                            fullWidth
                            onPress={handleConfirm}
                            isLoading={isPending}
                        >
                            Process Return
                        </Button>
                        <DrawerClose asChild>
                            <Button
                                variant='bordered'
                                fullWidth
                                onPress={handleClose}
                                isDisabled={isPending}
                            >
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Modal
            isOpen={isReturnOpen}
            onClose={handleClose}
            size='2xl'
            scrollBehavior='inside'
            classNames={{
                base: 'bg-background border shadow-xl',
                header: 'border-b',
                footer: 'bg-muted/10 border-t',
            }}
        >
            <ModalContent>
                <ModalHeader className='flex flex-col gap-1'>Return Order</ModalHeader>
                <ModalBody className='py-6'>{content}</ModalBody>
                <ModalFooter>
                    <Button variant='light' onPress={handleClose} isDisabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        color='warning'
                        className='shadow-warning/20 font-medium shadow-lg'
                        onPress={handleConfirm}
                        isLoading={isPending}
                    >
                        Process Return
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
