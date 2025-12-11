'use client'

import { Product } from '@/types/product'
import { Image, Button, Chip, Divider } from '@heroui/react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerBody,
    DrawerFooter,
} from '@/ui/drawer'

import { getProductImage, formatPrice, formatDiscount, getStockStatus } from '@/lib/utils'

import { usePosStore } from '@/zustand/store'
import { ActiveTabs } from '@/app/[user]/[slug]/ui/pos/product/card'
import NumberFlow from '@number-flow/react'
import { useMediaQuery } from '@/hooks'

interface ProductModalProps {
    product: Product
    isOpen: boolean
    onOpenChange?: (isOpen: boolean) => void
}

export function ProductModal({ product, isOpen, onOpenChange }: ProductModalProps) {
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const { allBrands, colors, storages, selected, setSelected, active } = usePosStore(product)

    const variant = active
    const stockStatus = variant ? getStockStatus(variant.quantity) : null
    const discount = variant ? formatDiscount(variant.price, variant.mrp) : null

    return (
        <Drawer
            direction={isDesktop ? 'right' : 'bottom'}
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <DrawerContent showbar={!isDesktop}>
                <DrawerBody className='flex flex-col'>
                    <Image
                        isBlurred
                        alt={product.name}
                        className={`rounded-md object-contain ${isDesktop ? 'aspect-square' : 'aspect-video'}`}
                        classNames={{
                            img: `rounded-2xl ${isDesktop ? 'aspect-square' : 'aspect-video'}`,
                            wrapper: `mx-auto overflow-hidden rounded-2xl ${isDesktop ? 'aspect-square' : 'aspect-video'}`,
                        }}
                        src={getProductImage(product)}
                    />

                    <DrawerHeader className='px-0 py-3'>
                        <DrawerTitle className='text-xl font-semibold tracking-tight'>
                            {product.name}
                        </DrawerTitle>

                        <DrawerDescription className='text-xs'>
                            {product.category}
                        </DrawerDescription>

                        {/* Pricing */}
                        <div className='flex items-center gap-3'>
                            <NumberFlow
                                className='text-foreground text-2xl font-bold'
                                format={{
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0,
                                }}
                                value={variant?.price || 0}
                            />

                            <span className='text-muted-foreground text-sm line-through'>
                                {formatPrice(variant?.mrp || 0)}
                            </span>

                            {discount && (
                                <Chip
                                    size='sm'
                                    className='flex items-center gap-1 bg-green-600 text-white'
                                >
                                    <NumberFlow
                                        className='font-semibold'
                                        value={parseFloat(discount.off)}
                                    />
                                    <span>% OFF</span>
                                </Chip>
                            )}
                        </div>
                    </DrawerHeader>
                    <Divider />
                    <div className='flex flex-col gap-3 py-3'>
                        {product.compatibility && (
                            <div>
                                <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
                                    Compatibility
                                </h3>
                                <p className='text-default-700 text-sm leading-snug'>
                                    {product.compatibility}
                                </p>
                            </div>
                        )}
                        {allBrands.length > 0 && (
                            <ActiveTabs
                                items={allBrands}
                                selectedKey={selected.brand}
                                title='Brand'
                                size='lg'
                                onSelectionChange={(key) => setSelected.brand(key as string)}
                            />
                        )}

                        {colors.length > 0 && selected.brand && (
                            <ActiveTabs
                                items={colors}
                                selectedKey={selected.color}
                                title='Color'
                                size='lg'
                                onSelectionChange={(key) => setSelected.color(key as string)}
                            />
                        )}

                        {storages.length > 0 && selected.brand && (
                            <ActiveTabs
                                items={storages}
                                selectedKey={selected.storage}
                                title='Storage'
                                size='lg'
                                onSelectionChange={(key) => setSelected.storage(key as string)}
                            />
                        )}
                    </div>
                </DrawerBody>
                <DrawerFooter>
                    <Button radius='full' className={`${stockStatus?.color} text-white`}>
                        {stockStatus?.text}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
