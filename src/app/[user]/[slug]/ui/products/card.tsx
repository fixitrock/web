'use client'

import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { useDebounce } from '@/hooks'
import { useUserProducts } from '@/hooks/tanstack/query'
import { formatPrice, getProductImage } from '@/lib/utils'
import { Product, Products } from '@/types/product'
import { Navbar, Button, Card, useDisclosure } from '@heroui/react'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useState, memo } from 'react'
import { ProductGridSkeleton } from './skeleton'
import { PosEmptyState } from '@/ui/empty'
import { ProductModal } from '@/app/[user]/ui/tabs/products/modal'

const ProductCard = memo(({ product }: { product: Product }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const imageUrl = getProductImage(product)

    return (
        <div className='relative'>
            <Card
                isPressable
                className='bg-background size-full gap-2 rounded-xl border p-1.5 will-change-transform'
                shadow='none'
                onPress={onOpen}
            >
                <div className='bg-default/10 relative aspect-square w-full overflow-hidden rounded-lg'>
                    {imageUrl && (
                        <Image
                            alt={product.name}
                            src={imageUrl}
                            fill
                            className='object-cover select-none'
                            sizes='(max-width: 640px) 140px, 220px'
                        />
                    )}
                </div>
                <div className='flex flex-1 flex-col'>
                    <h3 className='line-clamp-1 text-start text-sm font-semibold'>
                        {product.name}
                    </h3>
                    <div className='text-muted-foreground flex w-full justify-between text-xs'>
                        <span>{product.category}</span>
                        <span>{formatPrice(product.variants?.[0]?.price)}</span>
                    </div>
                </div>
            </Card>
            <ProductModal isOpen={isOpen} product={product} onOpenChange={onOpenChange} />
        </div>
    )
})

ProductCard.displayName = 'ProductCard'

const ProductGrid = memo(({ products }: { products: Products }) => {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
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
                classNames={{
                    wrapper: 'h-auto w-full p-0 py-2',
                }}
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
                        onValueChange={(value) => setQuery(value)}
                        end={
                            <>
                                {/* {query && (
                                            <Button
                                                isIconOnly
                                                className='bg-default/20 h-6.5 w-6.5 min-w-auto border-1 p-0'
                                                radius='full'
                                                size='sm'
                                                startContent={<X size={18} />}
                                                variant='light'
                                                onPress={() => setQuery('')}
                                            />
                                        )} */}
                                {can.create.product && (
                                    <Button
                                        isIconOnly
                                        className='border-1.5 bg-default/20 h-6.5 w-6.5 min-w-auto border-dashed p-0 md:hidden'
                                        radius='full'
                                        size='sm'
                                        startContent={<Plus size={20} />}
                                        variant='light'
                                        // onPress={addModal.onOpen}
                                    />
                                )}
                            </>
                        }
                    />
                    {can.create.product && (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            variant='light'
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
