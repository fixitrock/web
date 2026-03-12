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
import { Button } from '@heroui/react'
import { ListFilter } from 'lucide-react'

export function ProductsTabs({ user }: { user: User }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const { activeCategory } = useCategoryTabsStore()
    const activeFilter = activeCategory === 'all' ? '' : (activeCategory ?? '')
    const { data, isLoading } = useUserProducts(
        user.username || '',
        debouncedQuery,
        activeFilter
    )
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !activeFilter

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!activeFilter && !query

    return (
        <div className='bg-background flex flex-col'>
            <div className='bg-background/90 px-1.5 supports-backdrop-filter:bg-background/90 sticky top-8.25 z-20 flex w-full flex-col-reverse items-center justify-between gap-1.5 py-1 backdrop-blur sm:flex-row'>
                <CategoryTabs username={user.username || ''} />
                <div className='flex w-full items-center gap-2 sm:w-[50%] md:w-[40%] xl:w-[25%]'>
                    <Input
                        placeholder={
                            activeFilter && activeFilter !== 'All'
                                ? `Search products in ${activeFilter} . . .`
                                : 'Search across all products . . .'
                        }
                        hotKey='P'
                        end={
                            <Button
                                isIconOnly
                                className='h-8 w-8 min-w-0 p-0'
                                radius='full'
                                size='sm'
                                startContent={<ListFilter size={18} />}
                                variant='light'
                            />
                        }
                        value={query}
                        onValueChange={(value) => setQuery(value)}
                    />
                </div>
            </div>
            <div className='p-2'>
            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={activeFilter} />}
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
            </div>

        </div>
    )
}
