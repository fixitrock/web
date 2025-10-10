'use client'

import { useActionState } from 'react'
import { useRef, useEffect } from 'react'
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Button,
    Form,
    ModalFooter,
    Image,
} from '@heroui/react'
import { Trash2, X } from 'lucide-react'
import { addToast } from '@heroui/react'
import { MdProductionQuantityLimits } from 'react-icons/md'

import { softDeleteProduct } from '@/actions/user/products'
import { Product } from '@/types/product'
import { formatPrice, getProductImage, getStockStatus } from '@/lib/utils'

interface DeleteProductProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
}

export default function DeleteProduct({ isOpen, onClose, product }: DeleteProductProps) {
    const [{ errors }, formAction, isLoading] = useActionState(softDeleteProduct, { errors: {} })
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const errorMessage = errors.general || 'Please check the form fields'

            addToast({
                title: errorMessage,
                color: 'danger',
            })
        } else if (errors && Object.keys(errors).length === 0 && !isLoading) {
            // Success - close modal
            onClose()
        }
    }, [errors, isLoading, onClose])

    if (!product) return null

    const renderProductImage = () => {
        const src = getProductImage(product)

        if (src) {
            return (
                <Image
                    alt={product.name}
                    className='size-28 rounded-xl border object-cover transition-all duration-300 hover:scale-105'
                    src={src}
                />
            )
        }

        return (
            <div className='text-muted-foreground flex size-28 items-center justify-center rounded-xl border bg-gradient-to-br from-gray-50 to-gray-200 text-5xl shadow-inner dark:from-neutral-900 dark:to-neutral-800'>
                <MdProductionQuantityLimits />
            </div>
        )
    }

    // Helper for product pop details
    const popDetails = [
        { label: 'Brand', value: product.brand },
        { label: 'Category', value: product.category },
        { label: 'Stock', value: `${product.qty} (${getStockStatus(product.qty).text})` },
        { label: 'Price', value: product.price ? formatPrice(product.price) : undefined },
    ].filter((d) => d.value)

    return (
        <Modal
            hideCloseButton
            className='rounded-2xl border shadow-2xl dark:bg-[#0a0a0a]'
            isOpen={isOpen}
            placement='center'
            size='lg'
            onClose={onClose}
        >
            <Form ref={formRef} action={formAction} id='delete-product' validationErrors={errors}>
                <ModalContent>
                    <ModalHeader className='flex-1 items-center justify-between rounded-t-2xl border-b bg-gradient-to-r from-red-50/80 to-transparent select-none dark:from-red-900/30 dark:to-transparent'>
                        <div className='flex items-center gap-2'>
                            <Trash2 className='animate-bounce text-red-600' />
                            <span className='text-lg font-bold'>Delete Product</span>
                        </div>
                        <Button
                            isIconOnly
                            className='border'
                            radius='full'
                            size='sm'
                            startContent={<X size={18} />}
                            variant='light'
                            onPress={onClose}
                        />
                    </ModalHeader>
                    <ModalBody className='items-center py-6 md:flex-row'>
                        <input name='id' type='hidden' value={product.id.toString()} />
                        {renderProductImage()}
                        <div className='flex w-full max-w-xs flex-col gap-2'>
                            <h1 className='line-clamp-1 text-2xl font-bold text-red-600'>
                                {product.name}
                            </h1>
                            {product.description && (
                                <p className='text-muted-foreground line-clamp-2 text-sm'>
                                    {product.description}
                                </p>
                            )}
                            <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                                {popDetails.map((d) => (
                                    <div key={d.label} className='text-muted-foreground text-xs'>
                                        <span className='font-semibold'>{d.label}:</span>{' '}
                                        <span>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className='flex-row-reverse gap-2 border-t bg-gradient-to-r from-red-50/60 to-transparent dark:from-red-900/20 dark:to-transparent'>
                        <Button
                            fullWidth
                            className='font-semibold'
                            color='danger'
                            isLoading={isLoading}
                            radius='full'
                            startContent={<Trash2 size={20} />}
                            type='submit'
                        >
                            {isLoading ? 'Deleting...' : 'Yes, Delete / हाँ, डिलीट करें'}
                        </Button>
                        <Button
                            className='w-full border font-medium'
                            radius='full'
                            type='button'
                            variant='light'
                            onPress={onClose}
                        >
                            Cancel / रद्द करें
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Form>
        </Modal>
    )
}
