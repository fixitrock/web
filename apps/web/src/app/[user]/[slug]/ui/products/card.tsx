'use client'

import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { useDebounce } from '@/hooks'
import { useUserProducts } from '@/hooks/tanstack/query'
import { formatPrice, getProductImage } from '@/lib/utils'
import { Product, Products } from '@/types/product'
import { Button, Card, useOverlayState } from '@heroui/react'
import { Navbar } from '@heroui/navbar'
import { Plus } from 'lucide-react'
import { useState, memo } from 'react'
import { ProductGridSkeleton } from './skeleton'
import { PosEmptyState } from '@/ui/empty'
import { ProductModal } from '@/app/[user]/ui/tabs/products/modal'
import Image from 'next/image'
import AnimatedDiv from '@/ui/farmer/div'
import { BlogCardAnimation, fromLeftVariant } from '@/lib/FramerMotionVariants'

const ProductCard = memo(({ product }: { product: Product }) => {
    const overlayState = useOverlayState()
    const imageUrl = getProductImage(product)

    return (
        <div className='relative'>
            <button
                className='w-full text-left'
                type='button'
                onClick={overlayState.open}
            >
                <Card className='bg-background size-full gap-2 rounded-xl border p-1.5 will-change-transform shadow-none'>
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
                            <h3 className='line-clamp-1 text-start text-sm font-semibold'>
                                {product.name}
                            </h3>
                            <div className='text-muted-foreground flex w-full justify-between text-xs'>
                                <span>{product.category}</span>
                                <span>{formatPrice(product.variants?.[0]?.price ?? 0)}</span>
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </button>
            <ProductModal
                isOpen={overlayState.isOpen}
                product={product}
                onOpenChange={overlayState.setOpen}
            />
        </div>
    )
})

ProductCard.displayName = 'ProductCard'

const ProductGrid = memo(({ products }: { products: Products }) => {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {products.map((p) => (
                <AnimatedDiv
                    key={p.id}
                    className='size-full'
                    mobileVariants={BlogCardAnimation}
                    variants={fromLeftVariant}
                >
                    <ProductCard key={p.id} product={p} />
                </AnimatedDiv>
            ))}
        </div>
    )
})

ProductGrid.displayName = 'ProductGrid'

export { ProductGrid }

export function ProductsPage({ can, username }: { can: CanType; username: string }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data, isLoading } = useUserProducts(username, debouncedQuery, category || '')
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !category

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!category && !query
    return (
        <div className='flex flex-col gap-2'>
            <Navbar
                className='h-auto w-full p-0 py-2'
                maxWidth='full'
            >
                <div className='hidden items-center gap-1 md:flex md:w-[50%] lg:w-[70%]'>
                    <h1 className='text-xl font-bold'>Products</h1>
                </div>
                <div
                    className={`${can.create.product ? 'lg:w-[30%]' : 'lg:w-[20%]'} flex w-full items-center gap-4 md:w-[50%]`}
                >
                    <Input
                        placeholder='Search Products . . . '
                        hotKey='P'
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        end={
                            <>
                                {/* {query && (
                                            <Button
                                                isIconOnly
                                                className='bg-default/20 h-6.5 w-6.5 min-w-auto border-1 p-0'
                                                radius='full'
                                                size='sm'
                                                startContent={<X size={18} />}
                                                variant='ghost'
                                                onPress={() => setQuery('')}
                                            />
                                        )} */}
                                {can.create.product && (
                                    <Button
                                        isIconOnly
                                        className='border-1.5 bg-default/20 h-6.5 w-6.5 min-w-auto border-dashed p-0 md:hidden'
                                        size='sm'
                                        variant='ghost'
                                        // onPress={addModal.onOpen}
                                    >
                                        <Plus size={20} />
                                    </Button>
                                )}
                            </>
                        }
                    />
                    {can.create.product && (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            variant='ghost'
                            // onPress={addModal.onOpen}
                            size='sm'
                        >
                            <Plus size={18} /> Add Product
                        </Button>
                    )}
                </div>
            </Navbar>
            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={category} />}
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
        </div>
    )
}



