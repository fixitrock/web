'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Minus, Plus, RotateCcw } from 'lucide-react'
import { Button, InputGroup, Label as HeroLabel, Modal, TextField } from '@heroui/react'

import { fallback } from '@/config/site'
import { useMediaQuery } from '@/hooks'
import { useReturnOrder } from '@/hooks/tanstack/mutation/order'
import { bucketUrl } from '@/supabase/bucket'
import { MyOrderItem, Order, ReturnData } from '@/types/orders'
import { Alert, AlertDescription } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import {
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerNested,
    DrawerTitle,
} from '@/ui/drawer'
import { Label } from '@/ui/label'
import { useOrderStore } from '@/zustand/store/orders'

type ReturnOrderSource = Order | MyOrderItem

type ReturnableProduct = {
    productId: string
    image: string | null
    name: string
    brand: string | null
    price: number
    quantity: number
    returnedQuantity: number
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount)
}

function normalizeProducts(order: ReturnOrderSource): ReturnableProduct[] {
    return order.products
        .map((product, index) => {
            const fallbackId = String(product.id ?? `${order.id ?? 'order'}-${index}`)
            const productId =
                product.productID ||
                ('productId' in product ? product.productId : null) ||
                ('product_id' in product ? product.product_id : null) ||
                fallbackId

            if (!productId) {
                return null
            }

            return {
                productId,
                image: 'image' in product ? (product.image ?? null) : null,
                name: product.name,
                brand: 'brand' in product ? (product.brand ?? null) : null,
                price: product.price,
                quantity: product.quantity,
                returnedQuantity: product.returnedQuantity || 0,
            }
        })
        .filter((product): product is ReturnableProduct => product !== null)
}

export function ReturnOrder() {
    const { selectedOrder, isReturnOpen, closeReturn } = useOrderStore()
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const { mutate: processReturn, isPending } = useReturnOrder()

    const currentOrder = selectedOrder as unknown as ReturnOrderSource | null
    const products = useMemo(
        () => (currentOrder ? normalizeProducts(currentOrder) : []),
        [currentOrder]
    )

    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map())
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    const resetState = () => {
        setSelectedItems(new Map())
        setReason('')
        setError('')
    }

    useEffect(() => {
        resetState()
    }, [currentOrder?.id])

    const handleClose = () => {
        resetState()
        closeReturn()
    }

    const handleQuantityChange = (productId: string, delta: number, maxQty: number) => {
        setSelectedItems((previous) => {
            const next = new Map(previous)
            const current = next.get(productId) || 0
            const value = Math.max(0, Math.min(maxQty, current + delta))

            if (value === 0) {
                next.delete(productId)
            } else {
                next.set(productId, value)
            }

            return next
        })
        setError('')
    }

    const calculateRefundAmount = () => {
        return Array.from(selectedItems.entries()).reduce((sum, [productId, qty]) => {
            const product = products.find((item) => item.productId === productId)
            return sum + (product ? product.price * qty : 0)
        }, 0)
    }

    const handleConfirm = () => {
        const orderId = currentOrder?.id
        if (!orderId) {
            setError('Unable to process return for this order')
            return
        }

        if (selectedItems.size === 0) {
            setError('Please select at least one item to return')
            return
        }

        if (!reason.trim()) {
            setError('Please provide a reason for the return')
            return
        }

        const items = Array.from(selectedItems.entries())
            .map(([productId, quantity]) => {
                const product = products.find((item) => item.productId === productId)
                if (!product) return null

                return {
                    productId,
                    quantity,
                    maxQuantity: product.quantity - product.returnedQuantity,
                }
            })
            .filter(
                (
                    item
                ): item is {
                    productId: string
                    quantity: number
                    maxQuantity: number
                } => item !== null
            )

        if (items.length === 0) {
            setError('Please select at least one valid item to return')
            return
        }

        const returnableProducts = products.filter(
            (product) => product.quantity - product.returnedQuantity > 0
        )
        const isFullReturn =
            returnableProducts.length > 0 &&
            returnableProducts.every(
                (product) =>
                    (selectedItems.get(product.productId) || 0) ===
                    product.quantity - product.returnedQuantity
            )

        const returnData: ReturnData = {
            orderId,
            returnType: isFullReturn ? 'full' : 'partial',
            items,
            reason: reason.trim(),
        }

        processReturn(returnData, {
            onSuccess: handleClose,
        })
    }

    if (!isReturnOpen || !currentOrder) return null

    const content = (
        <div className='space-y-6'>
            <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                    <Label className='text-foreground/80 text-sm font-medium'>Order Items</Label>
                    <span className='text-muted-foreground text-xs'>Order ID: #{currentOrder.id}</span>
                </div>

                <div className='space-y-2'>
                    {products.map((product) => {
                        const returnedQty = product.returnedQuantity || 0
                        const totalQty = product.quantity
                        const remainingQty = totalQty - returnedQty
                        const isFullyReturned = remainingQty === 0
                        const selectedQty = selectedItems.get(product.productId) || 0

                        return (
                            <div
                                key={product.productId}
                                className={`group relative flex flex-col gap-3 rounded-xl border p-3 transition-all duration-200 ${
                                    isFullyReturned
                                        ? 'bg-default/10 border-transparent opacity-80'
                                        : 'bg-default/20 border'
                                }`}
                            >
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex min-w-0 flex-1 items-start gap-3'>
                                        <Image
                                            alt={product.name}
                                            className='border-default-200 h-12 w-12 rounded-lg border object-cover'
                                            height={48}
                                            src={product.image ? bucketUrl(product.image) : fallback.order}
                                            width={48}
                                        />
                                        <div className='min-w-0 flex-1'>
                                            <p
                                                className={`truncate text-sm leading-tight font-medium ${
                                                    isFullyReturned ? 'text-muted-foreground' : 'text-foreground'
                                                }`}
                                            >
                                                {product.name}
                                            </p>

                                            <div className='mt-1.5 flex flex-wrap gap-1.5'>
                                                {isFullyReturned ? (
                                                    <Badge
                                                        className='h-5 border-green-500/20 bg-green-500/10 px-1.5 text-[10px] text-green-600'
                                                        variant='secondary'
                                                    >
                                                        Returned
                                                    </Badge>
                                                ) : returnedQty > 0 ? (
                                                    <Badge
                                                        className='h-5 border-orange-500/20 bg-orange-500/10 px-1.5 text-[10px] text-orange-600'
                                                        variant='secondary'
                                                    >
                                                        Partially Returned
                                                    </Badge>
                                                ) : null}

                                                {product.brand ? (
                                                    <Badge
                                                        className='text-muted-foreground h-5 px-1.5 text-[10px]'
                                                        variant='outline'
                                                    >
                                                        {product.brand}
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <div className='text-muted-foreground mt-2 flex items-center gap-3 text-xs'>
                                                <span className='text-foreground/80 font-medium'>
                                                    {formatCurrency(product.price)}
                                                </span>
                                                <span className='bg-border h-1 w-1 rounded-full' />
                                                <span>Qty: {totalQty}</span>
                                                {returnedQty > 0 ? (
                                                    <>
                                                        <span className='bg-border h-1 w-1 rounded-full' />
                                                        <span className='font-medium text-orange-600'>
                                                            Returned: {returnedQty}
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {!isFullyReturned ? (
                                        <div className='flex flex-col items-end gap-1'>
                                            <div className='bg-background flex items-center gap-1 rounded-lg border p-0.5 shadow-sm'>
                                                <Button
                                                    isDisabled={selectedQty === 0}
                                                    isIconOnly
                                                    className='text-default-500 data-[hover=true]:bg-default-100 h-7 w-7'
                                                    size='sm'
                                                    variant='ghost'
                                                    onPress={() =>
                                                        handleQuantityChange(product.productId, -1, remainingQty)
                                                    }
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className='w-8 text-center font-mono text-sm font-semibold tabular-nums'>
                                                    {selectedQty}
                                                </span>
                                                <Button
                                                    isDisabled={selectedQty >= remainingQty}
                                                    isIconOnly
                                                    className='text-default-500 data-[hover=true]:bg-default-100 h-7 w-7'
                                                    size='sm'
                                                    variant='ghost'
                                                    onPress={() =>
                                                        handleQuantityChange(product.productId, 1, remainingQty)
                                                    }
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                            <span className='text-muted-foreground px-1 text-[10px]'>
                                                Max: {remainingQty}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <TextField isRequired>
                <HeroLabel>Return Reason</HeroLabel>
                <InputGroup>
                    <InputGroup.TextArea
                        placeholder='Please provide a detailed reason for the return...'
                        rows={4}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    />
                </InputGroup>
            </TextField>

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

            {error ? (
                <Alert className='animate-in fade-in slide-in-from-top-1' variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription className='text-xs font-medium'>{error}</AlertDescription>
                </Alert>
            ) : null}
        </div>
    )

    if (isDesktop) {
        return (
            <Modal>
                <Modal.Backdrop isOpen={isReturnOpen} variant='blur' onOpenChange={(open) => !open && handleClose()}>
                    <Modal.Container
                        className='overflow-hidden rounded-[20px] border bg-background shadow-xl'
                        scroll='inside'
                        size='lg'
                    >
                        <Modal.Dialog>
                            <Modal.Header className='border-b'>
                                <Modal.Heading>Return Order</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body className='py-6'>{content}</Modal.Body>
                            <Modal.Footer className='bg-muted/10 border-t'>
                                <Button isDisabled={isPending} variant='secondary' onPress={handleClose}>
                                    Cancel
                                </Button>
                                <Button isPending={isPending} variant='primary' onPress={handleConfirm}>
                                    Submit Return
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        )
    }

    return (
        <DrawerNested open={isReturnOpen} onOpenChange={(open) => !open && handleClose()}>
            <DrawerContent className='h-[70dvh]'>
                <DrawerHeader className='border-b text-left'>
                    <DrawerTitle>Return Order</DrawerTitle>
                </DrawerHeader>
                <DrawerBody className='px-4'>{content}</DrawerBody>
                <DrawerFooter className='border-t'>
                    <Button fullWidth isPending={isPending} variant='primary' onPress={handleConfirm}>
                        Submit Return
                    </Button>
                    <DrawerClose asChild>
                        <Button fullWidth isDisabled={isPending} variant='secondary' onPress={handleClose}>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </DrawerNested>
    )
}
