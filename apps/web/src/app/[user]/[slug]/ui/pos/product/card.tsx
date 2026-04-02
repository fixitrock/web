'use client'

import React, { memo, useState } from 'react'

import { Icon } from '@iconify/react'
import { Button, Card, Modal, Skeleton, Tabs, toast, useOverlayState } from '@heroui/react'
import { Eye, EyeOff, XIcon } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

import { Product, Products } from '@/types/product'
import { useCartStore } from '@/zustand/store/cart'
import { usePosStore, usePosTypeStore } from '@/zustand/store'
import { useProductStore } from '@/zustand/store/product'
import { formatPrice, getProductImage } from '@/lib/utils'
import AnimatedDiv from '@/ui/farmer/div'
import { BlogCardAnimation, fromLeftVariant } from '@/lib/FramerMotionVariants'

export function ProductCard({ product }: { product: Product }) {
    const overlayState = useOverlayState()
    const { setMode } = useProductStore()
    const router = useRouter()
    const pathname = usePathname()
    const imageUrl = getProductImage(product)

    const openUpdateModal = (currentProduct: Product) => {
        setMode('update', currentProduct)
        router.push(`${pathname}/update/${currentProduct.slug}`)
    }

    return (
        <div className='group relative'>
            <button className='w-full text-left' type='button' onClick={overlayState.open}>
                <Card className='bg-background size-full gap-2 rounded-xl border p-1.5 shadow-none will-change-transform'>
                    <div className='bg-default/10 relative aspect-square w-full overflow-hidden rounded-lg'>
                        {imageUrl ? (
                            <Image
                                alt={product.name}
                                className='object-cover select-none'
                                fill
                                sizes='(max-width: 640px) 140px, 220px'
                                src={imageUrl}
                            />
                        ) : null}
                    </div>
                    <Card.Content className='p-0'>
                        <div className='flex flex-1 flex-col'>
                            <h3 className='line-clamp-1 text-start text-sm font-semibold'>{product.name}</h3>
                            <div className='text-muted-foreground flex w-full justify-between text-xs'>
                                <span>{product.category}</span>
                                <span>{formatPrice(product.variants?.[0]?.price ?? 0)}</span>
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </button>
            <div className='absolute top-2 right-2 z-10 flex gap-2'>
                <Button
                    isIconOnly
                    className='bg-background/80 border backdrop-blur'
                    size='sm'
                    variant='ghost'
                    onPress={() => openUpdateModal(product)}
                >
                    <Icon
                        className='text-muted-foreground'
                        height='18'
                        icon='hugeicons:quill-write-02'
                        width='18'
                    />
                </Button>
            </div>
            <ProductModal isOpen={overlayState.isOpen} product={product} onOpenChange={overlayState.setOpen} />
        </div>
    )
}

const ProductGrid = memo(({ products }: { products: Products }) => {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {products.map((product) => (
                <AnimatedDiv
                    key={product.id}
                    className='size-full'
                    mobileVariants={BlogCardAnimation}
                    variants={fromLeftVariant}
                >
                    <ProductCard key={product.id} product={product} />
                </AnimatedDiv>
            ))}
        </div>
    )
})

ProductGrid.displayName = 'ProductGrid'

export { ProductGrid }

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
        setReveal((current) => !current)
    }

    const handleAddToCart = () => {
        if (active && active.quantity > 0) {
            const price = type === 'retail' ? active.price : active.wholesale_price
            const firstImage = Array.isArray(active.image) ? active.image[0] : null
            const imageUrl = typeof firstImage === 'string' ? firstImage : null

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
                toast.warning('Cannot Add Item', {
                    description: `Only ${active.quantity} items available in stock`,
                })
            }
        }
    }

    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} variant='blur' onOpenChange={onOpenChange}>
                <Modal.Container className='overflow-hidden rounded-2xl border bg-background' scroll='inside' size='md'>
                    <Modal.Dialog>
                        <Modal.Header className='flex flex-col border-b p-3'>
                            <div className='flex items-center'>
                                <div className='flex flex-col'>
                                    <Modal.Heading className='line-clamp-1'>{product.name}</Modal.Heading>
                                    <p className='text-muted-foreground text-xs'>{product.category}</p>
                                </div>
                                <div className='ml-auto flex items-center gap-1.5'>
                                    {type === 'wholesale' ? (
                                        <>
                                            {reveal ? formatPrice(active?.purchase_price || 0) : null}
                                            <Button
                                                isIconOnly
                                                size='sm'
                                                variant='ghost'
                                                onMouseDown={toggleReveal}
                                                onMouseLeave={() => setReveal(false)}
                                                onMouseUp={() => setReveal(false)}
                                                onTouchEnd={() => setReveal(false)}
                                                onTouchStart={toggleReveal}
                                            >
                                                {reveal ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </Button>
                                        </>
                                    ) : null}

                                    <Button
                                        isIconOnly
                                        className='border'
                                        size='sm'
                                        variant='ghost'
                                        onPress={() => onOpenChange?.(false)}
                                    >
                                        <XIcon className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                            {product.compatibility ? (
                                <p className='text-muted-foreground mt-0.5 text-xs'>{product.compatibility}</p>
                            ) : null}
                        </Modal.Header>
                        <Modal.Body className='p-3 select-none'>
                            {allBrands.length > 0 ? (
                                <ActiveTabs
                                    items={allBrands}
                                    selectedKey={selected.brand as string}
                                    title='Brand'
                                    onSelectionChange={(key) => setSelected.brand(key as string)}
                                />
                            ) : null}

                            {colors.length > 0 && selected.brand ? (
                                <ActiveTabs
                                    items={colors}
                                    selectedKey={selected.color as string}
                                    title='Color'
                                    onSelectionChange={(key) => setSelected.color(key as string)}
                                />
                            ) : null}

                            {storages.length > 0 && selected.brand ? (
                                <ActiveTabs
                                    items={storages}
                                    selectedKey={selected.storage as string}
                                    title='Storage'
                                    onSelectionChange={(key) => setSelected.storage(key as string)}
                                />
                            ) : null}
                            <div className='grid grid-cols-2 gap-2'>
                                <div className='flex flex-col'>
                                    <p className='text-muted-foreground text-sm font-medium'>Quantity</p>
                                    <h3 className='text-lg font-semibold'>{active?.quantity || 0}</h3>
                                </div>
                                {type === 'retail' ? (
                                    <div className='flex flex-col'>
                                        <p className='text-muted-foreground text-sm font-medium'>Price</p>
                                        <h3 className='text-lg font-semibold'>{formatPrice(active?.price || 0)}</h3>
                                    </div>
                                ) : (
                                    <div className='flex flex-col'>
                                        <p className='text-muted-foreground text-sm font-medium'>Wholesale Price</p>
                                        <h3 className='text-lg font-semibold'>
                                            {formatPrice(active?.wholesale_price || 0)}
                                        </h3>
                                    </div>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className='justify-normal border-t p-3'>
                            <Button fullWidth isDisabled={!active || active.quantity === 0} variant='primary' onPress={handleAddToCart}>
                                Add to Cart
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}

type ActiveTabsProps = {
    title: string
    items: string[]
} & Omit<React.ComponentPropsWithoutRef<typeof Tabs>, 'children' | 'items'>

export function ActiveTabs({ title, items, ...tabsProps }: ActiveTabsProps) {
    return (
        <div>
            <h3 className='text-muted-foreground mb-1 text-sm font-medium'>{title}</h3>
            <Tabs aria-label={title} variant='secondary' {...tabsProps}>
                <Tabs.ListContainer>
                    <Tabs.List className='w-full bg-default/15'>
                        {items.map((item) => (
                            <Tabs.Tab key={item} id={item}>
                                {item}
                                <Tabs.Indicator className='w-full' />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
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
