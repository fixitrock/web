'use client'

import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { useDebounce, useDragScroll } from '@/hooks'
import { useUserProducts } from '@/hooks/tanstack/query'
import { formatDiscount, formatPrice, getProductImage } from '@/lib/utils'
import { Product, Products } from '@/types/product'
import { ScrollShadow, Image, Navbar, Button } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ProductGridSkeleton } from './skeleton'

function ProductCard({ product }: { product: Product }) {
    const variants = product.variants || []
    const drag = useDragScroll<HTMLDivElement>()

    return (
        <div className='group flex flex-col gap-2 rounded-xl border p-1.5'>
            <div className='relative m-auto w-full shrink-0'>
                <Image
                    removeWrapper
                    alt={product.name}
                    className='bg-default/10 aspect-square size-full object-cover select-none'
                    loading='lazy'
                    src={getProductImage(product)}
                />
                <div className='absolute bottom-1 z-20 flex w-full overflow-auto'>
                    <ScrollShadow
                        ref={drag}
                        hideScrollBar
                        className='bg-default/10 auto mx-auto flex max-w-[50%] items-center gap-1.5 rounded-2xl backdrop-blur'
                        orientation='horizontal'
                    >
                        {variants
                            .filter((v) => v.color?.hex)
                            .map((v, i) => (
                                <span
                                    key={`color-${i}`}
                                    className='inline-block size-2.5 shrink-0 rounded-full'
                                    style={{ backgroundColor: v.color?.hex || '#ccc' }}
                                    title={v.color?.name || ''}
                                />
                            ))}
                    </ScrollShadow>
                </div>
                {product.variants?.[0]?.price && product.variants?.[0]?.mrp && (
                    <h3 className='absolute top-0.5 right-0.5 z-10 rounded-full bg-green-300 px-1.5 py-0.5 text-[10px] text-white'>
                        {
                            formatDiscount(
                                product.variants?.[0]?.price || 0,
                                product.variants?.[0]?.mrp || 0
                            ).off
                        }
                    </h3>
                )}
            </div>
            <div className='flex flex-1 flex-col'>
                <h3 className='line-clamp-1 text-sm font-semibold'>{product.name}</h3>
                <div className='text-muted-foreground flex w-full justify-between text-xs'>
                    <span>{product.category}</span>
                    <span>{formatPrice(product.variants?.[0]?.price || 0)}</span>
                </div>
            </div>
        </div>
    )
}

export function ProductGrid({ products }: { products: Products }) {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 overflow-y-auto md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    )
}

export function ProductsPage({ can, username }: { can: CanType; username: string }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data, isLoading } = useUserProducts(username, debouncedQuery, category || '')
    return (
        <div className='flex flex-col gap-2'>
            <Navbar
                shouldHideOnScroll
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
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
        </div>
    )
}
