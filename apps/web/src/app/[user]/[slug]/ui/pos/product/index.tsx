'use client'

import { useState } from 'react'
import { ScrollShadow } from '@heroui/react'

import { Input } from '@/app/(space)/ui'
import { useDebounce } from '@/hooks'
import { usePosCategories, useSellerProducts } from '@/hooks/tanstack/query'
import { cn } from '@/lib/utils'
import { PosEmptyState } from '@/ui/empty'

import { Category } from '../category'
import { ProductGridSkeleton } from '../../products/skeleton'
import { ProductGrid } from './card'

type Props = {
    className?: string
}

export function PosProduct({ className }: Props): React.ReactNode {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data: categories } = usePosCategories()
    const { data, isLoading } = useSellerProducts(debouncedQuery, category || '')

    const isProductsEmpty = !isLoading && data?.products.length === 0
    const showEmptyState = isProductsEmpty && !query && !category
    const showSearchEmpty = isProductsEmpty && !!query
    const showCategoryEmpty = isProductsEmpty && !!category && !query

    return (
        <section
            aria-label='Products'
            className={cn(
                'flex h-full w-full flex-col gap-2 rounded-2xl border p-2 transition-all duration-300 ease-in-out',
                className
            )}
            data-slot='products'
        >
            <div className='flex flex-col items-center gap-2 sm:flex-row'>
                <Input
                    hotKey='P'
                    placeholder='Search products . . .'
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Category categories={categories?.categories} value={category} onChange={setCategory} />
            </div>

            <ScrollShadow hideScrollBar className='p-0.5'>
                {showEmptyState ? <PosEmptyState type='product' /> : null}
                {showSearchEmpty ? <PosEmptyState type='search' value={query} /> : null}
                {showCategoryEmpty ? <PosEmptyState type='category' value={category} /> : null}
                {isLoading ? <ProductGridSkeleton /> : null}
                <ProductGrid products={data?.products || []} />
            </ScrollShadow>
        </section>
    )
}
