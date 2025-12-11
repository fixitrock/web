'use client'

import { useUserProducts } from '@/hooks/tanstack/query'
import { PosEmptyState } from '@/ui/empty'
import { useState } from 'react'
import { useDebounce } from '@/hooks'
import { Input } from '@/app/(space)/ui'
import { ProductGridSkeleton } from '@/app/[user]/[slug]/ui/products/skeleton'
import { ProductGrid } from '@/app/[user]/[slug]/ui/products/card'
import { CategoryTabs } from './categories'
import { useCategoryTabsStore } from '@/zustand/store'
import { User } from '@/types/users'

export function ProductsTabs({ user }: { user: User }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const { activeCategory } = useCategoryTabsStore()
    const { data, isLoading } = useUserProducts(
        user.username || '',
        debouncedQuery,
        activeCategory || ''
    )
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !activeCategory

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!activeCategory && !query

    return (
        <div className='bg-background flex flex-col gap-2.5'>
            <div className='bg-background/90 supports-backdrop-filter:bg-background/90 sticky top-[33px] z-20 flex w-full flex-col-reverse items-center justify-between gap-1.5 py-1.5 backdrop-blur sm:flex-row'>
                <CategoryTabs username={user.username || ''} />
                <div className='flex w-full items-center gap-2 sm:w-[50%] md:w-[40%] xl:w-[25%]'>
                    <Input
                        placeholder={
                            activeCategory && activeCategory !== 'All'
                                ? `Search products in ${activeCategory} . . .`
                                : 'Search across all products . . .'
                        }
                        hotKey='P'
                        value={query}
                        onValueChange={(value) => setQuery(value)}
                    />
                </div>
            </div>
            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={activeCategory} />}
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
        </div>
    )
}
