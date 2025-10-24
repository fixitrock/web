'use client'

import { ScrollShadow } from '@heroui/react'
import { useState } from 'react'

import { useDebounce } from '@/hooks'
import { usePosCategories, usePosProducts } from '@/hooks/tanstack/query'
import { PosEmptyState } from '@/ui/empty'
import { Input } from '@/app/(space)/ui'

import { Category } from '../category'

import { ProductCard, ProductSkeleton } from './card'

export function PosProduct() {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data: cat } = usePosCategories()
    const { data, isLoading } = usePosProducts(debouncedQuery, category || undefined)

    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !category

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!category && !query

    return (
        <section
            aria-label='Products'
            className='flex w-[75%] flex-col gap-2 rounded-lg border p-2'
            data-slot='products'
        >
            <div className='flex items-center gap-2'>
                <Input
                    hotKey='P'
                    placeholder='Search products . . .'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Category categories={cat?.categories} value={category} onChange={setCategory} />
            </div>

            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={category} />}

            <ScrollShadow hideScrollBar size={60}>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2'>
                    {isLoading && (
                        <>
                            {Array.from({ length: 15 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </>
                    )}

                    {data?.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {/* <pre>{JSON.stringify(order(), null, 2)}</pre> */}
            </ScrollShadow>
        </section>
    )
}
