'use client'

import {
    Image,
    Modal,
    Card,
    useDisclosure,
    ModalContent,
    Skeleton,
    ModalHeader,
    ModalFooter,
    Button,
    ModalBody,
    Tabs,
    Tab,
    TabsProps,
    addToast,
} from '@heroui/react'
import React, { useState } from 'react'
import { Eye, EyeOff, XIcon } from 'lucide-react'

import { formatPrice, getProductImage } from '@/lib/utils'
import { Product } from '@/types/product'
import { usePosStore, usePosTypeStore } from '@/zustand/store'
import { useCartStore } from '@/zustand/store/cart'
import { AddProduct } from '../../products/add'
import { useProductStore } from '@/zustand/store/product'
import { Icon } from '@iconify/react'

export function ProductCard({ product }: { product: Product }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const { setMode } = useProductStore()
    const updateModal = useDisclosure({ defaultOpen: false })
    const openUpdateModal = (product: Product) => {
        setMode('update', product)
        updateModal.onOpen()
    }

    return (
        <div className='group relative'>
            <Card
                isPressable
                className='bg-background size-full gap-2 rounded-xl border p-1.5'
                shadow='none'
                onPress={onOpen}
            >
                <div className='relative m-auto w-full shrink-0'>
                    <Image
                        removeWrapper
                        alt={product.name}
                        className='bg-default/10 aspect-square size-full object-cover select-none'
                        loading='lazy'
                        src={getProductImage(product)}
                    />
                </div>

                <div className='flex flex-1 flex-col'>
                    <h3 className='line-clamp-1 text-start text-sm font-semibold'>
                        {product.name}
                    </h3>
                    <div className='text-muted-foreground flex w-full justify-between text-xs'>
                        <span>{product.category}</span>
                        <span>{formatPrice(product.variants?.[0]?.price || 0)}</span>
                    </div>
                </div>
            </Card>
            <div className='absolute top-2 right-2 z-10 flex gap-2'>
                <Button
                    isIconOnly
                    className='bg-background/80 border backdrop-blur'
                    radius='full'
                    size='sm'
                    startContent={
                        <Icon
                            icon='hugeicons:quill-write-02'
                            width='18'
                            height='18'
                            className='text-muted-foreground'
                        />
                    }
                    variant='light'
                    onPress={() => openUpdateModal(product)}
                />
            </div>
            <AddProduct mode='update' isOpen={updateModal.isOpen} onClose={updateModal.onClose} />
            <ProductModal isOpen={isOpen} product={product} onOpenChange={onOpenChange} />
        </div>
    )
}

interface ProductModalProps {
    product: Product
    isOpen: boolean
    onOpenChange?: (isOpen: boolean) => void
}
function ProductModal({ product, isOpen, onOpenChange }: ProductModalProps) {
    const { allBrands, colors, storages, selected, setSelected, active } = usePosStore(product)
    const { type } = usePosTypeStore()
    const { addItem } = useCartStore()
    const [reveal, setReveal] = useState(false)

    const toggleReveal = () => {
        setReveal(!reveal)
    }

    const handleAddToCart = () => {
        if (active && active.quantity > 0) {
            const price = type === 'retail' ? active.price : active.wholesale_price
            const imageUrl = typeof active.image[0] === 'string' ? active.image[0] : null

            const cartItem = {
                product: { id: product.id!, name: product.name, category: product.category },
                variant: active,
                quantity: 1,
                price,
                selectedOptions: {
                    image: imageUrl,
                    brand: selected.brand,
                    color: selected.color,
                    storage: selected.storage,
                },
            }

            if (
                useCartStore.getState().canAddItem(
                    {
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        variants: product.variants,
                    },
                    cartItem.selectedOptions
                )
            ) {
                addItem(cartItem)
                onOpenChange?.(false)
            } else {
                addToast({
                    title: 'Cannot Add Item',
                    description: `Only ${active.quantity} items available in stock`,
                    color: 'warning',
                })
            }
        }
    }

    return (
        <Modal
            hideCloseButton
            className='bg-background rounded-2xl border'
            isOpen={isOpen}
            placement='center'
            scrollBehavior='inside'
            shadow='none'
            size='md'
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                <ModalHeader className='flex items-center border-b p-3'>
                    <div className='flex flex-col'>
                        <h2 className='line-clamp-1'>{product.name}</h2>
                        <p className='text-muted-foreground text-xs'>{product.category}</p>
                        {product.compatibility && (
                            <p className='text-muted-foreground text-xs'>{product.compatibility}</p>
                        )}
                    </div>
                    <div className='ml-auto flex items-center gap-1.5'>
                        {type === 'wholesale' && (
                            <>
                                {reveal && formatPrice(active?.purchase_price || 0)}
                                <Button
                                    isIconOnly
                                    radius='full'
                                    size='sm'
                                    startContent={reveal ? <Eye size={16} /> : <EyeOff size={16} />}
                                    variant='light'
                                    onMouseDown={toggleReveal}
                                    onMouseLeave={() => setReveal(false)}
                                    onMouseUp={() => setReveal(false)}
                                    onTouchEnd={() => setReveal(false)}
                                    onTouchStart={toggleReveal}
                                />
                            </>
                        )}

                        <Button
                            isIconOnly
                            className='border'
                            radius='full'
                            size='sm'
                            startContent={<XIcon className='h-4 w-4' />}
                            variant='light'
                            onPress={() => onOpenChange?.(false)}
                        />
                    </div>
                </ModalHeader>
                <ModalBody className='p-3 select-none'>
                    {allBrands.length > 0 && (
                        <ActiveTabs
                            items={allBrands}
                            selectedKey={selected.brand}
                            title='Brand'
                            onSelectionChange={(key) => setSelected.brand(key as string)}
                        />
                    )}

                    {colors.length > 0 && selected.brand && (
                        <ActiveTabs
                            items={colors}
                            selectedKey={selected.color}
                            title='Color'
                            onSelectionChange={(key) => setSelected.color(key as string)}
                        />
                    )}

                    {storages.length > 0 && selected.brand && (
                        <ActiveTabs
                            items={storages}
                            selectedKey={selected.storage}
                            title='Storage'
                            onSelectionChange={(key) => setSelected.storage(key as string)}
                        />
                    )}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='flex flex-col'>
                            <p className='text-muted-foreground text-sm font-medium'>Quantity</p>
                            <h3 className='text-lg font-semibold'>{active?.quantity || 0}</h3>
                        </div>
                        {type === 'retail' ? (
                            <div className='flex flex-col'>
                                <p className='text-muted-foreground text-sm font-medium'>Price</p>
                                <h3 className='text-lg font-semibold'>
                                    {formatPrice(active?.price || 0)}
                                </h3>
                            </div>
                        ) : (
                            <div className='flex flex-col'>
                                <p className='text-muted-foreground text-sm font-medium'>
                                    Wholesale Price
                                </p>
                                <h3 className='text-lg font-semibold'>
                                    {formatPrice(active?.wholesale_price || 0)}
                                </h3>
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter className='justify-normal border-t p-3'>
                    <Button
                        fullWidth
                        color='primary'
                        isDisabled={!active || active.quantity === 0}
                        radius='full'
                        onPress={handleAddToCart}
                    >
                        Add to Cart
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

type ActiveTabsProps = {
    title: string
    items: string[]
} & Omit<TabsProps, 'items'>

export function ActiveTabs({ title, items, ...tabsProps }: ActiveTabsProps) {
    return (
        <div>
            <h3 className='text-muted-foreground mb-1 text-sm font-medium'>{title}</h3>
            <Tabs
                aria-label={title}
                classNames={{
                    cursor: 'bg-default/25 dark:bg-default/30 shadow-none',
                    tab: 'bg-default/15',
                }}
                radius='full'
                size='sm'
                variant='light'
                {...tabsProps}
            >
                {items.map((item) => (
                    <Tab key={item} title={item} />
                ))}
            </Tabs>
        </div>
    )
}

export function ProductSkeleton() {
    return (
        <div className='group flex flex-col gap-2 rounded-2xl border p-1.5'>
            <Skeleton className='aspect-square rounded-2xl' />
            <div className='flex flex-1 flex-col space-y-1'>
                <Skeleton className='line-clamp-1 h-4 w-[60%] rounded-full text-sm font-semibold' />
                <div className='text-muted-foreground flex w-full justify-between text-xs'>
                    <Skeleton className='h-4 w-16 rounded-lg' />
                    <Skeleton className='h-4 w-16 rounded-lg' />
                </div>
            </div>
        </div>
    )
}
