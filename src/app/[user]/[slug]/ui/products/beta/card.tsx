'use client'

import { ScrollShadow, Image, Skeleton } from '@heroui/react'

import { Product } from '@/types/product'
import { useDragScroll } from '@/hooks'
import { formatDiscount, formatPrice } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
    const variants = product.variants_cache || []
    const drag = useDragScroll<HTMLDivElement>()

    return (
        <div className='group flex flex-col gap-2 rounded-xl border p-1.5'>
            <div className='relative m-auto w-full shrink-0'>
                <Image
                    removeWrapper
                    alt={product.name}
                    className='bg-default/10 aspect-square size-full object-cover select-none'
                    loading='lazy'
                    src='https://images-eu.ssl-images-amazon.com/images/I/41sxNjq6ByL._SX300_SY300_QL70_FMwebp_.jpg'
                />
                <div className='absolute bottom-1 z-20 flex w-full overflow-auto'>
                    <ScrollShadow
                        ref={drag}
                        hideScrollBar
                        className='bg-default/10 auto mx-auto flex max-w-[50%] items-center gap-1.5 rounded-2xl backdrop-blur'
                        orientation='horizontal'
                    >
                        {variants
                            .filter((v) => v.color?.code)
                            .map((v, i) => (
                                <span
                                    key={`color-${i}`}
                                    className='inline-block size-2.5 shrink-0 rounded-full'
                                    style={{ backgroundColor: v.color?.code || '#ccc' }}
                                    title={v.color?.name || ''}
                                />
                            ))}
                    </ScrollShadow>
                </div>
                {product.price && product.mrp && (
                    <h3 className='absolute top-0.5 right-0.5 z-20 rounded-full bg-green-300 px-1.5 py-0.5 text-[10px] text-white'>
                        {formatDiscount(product.price, product.mrp).off}
                    </h3>
                )}
            </div>

            <div className='flex flex-1 flex-col'>
                <h3 className='line-clamp-1 text-sm font-semibold'>{product.name}</h3>
                <div className='text-muted-foreground flex w-full justify-between text-xs'>
                    <span> {product.category}</span>
                    <span>{formatPrice(product.price)}</span>
                </div>
            </div>
        </div>
    )
}

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 overflow-y-auto md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
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

export function ProductGridSkeleton({ count = 18 }: { count?: number }) {
    return (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    )
}
