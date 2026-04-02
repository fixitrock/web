'use client'

import { useUserProducts } from '@/hooks/tanstack/query'
import { PosEmptyState } from '@/ui/empty'
import { useDebounce } from '@/hooks'
import { Input } from '@/app/(space)/ui'
import { ProductGridSkeleton } from '@/app/[user]/[slug]/ui/products/skeleton'
import { ProductGrid } from '@/app/[user]/[slug]/ui/products/card'
import { CategoryTabs } from './categories'
import { useCategoryTabsStore } from '@/zustand/store'
import { User } from '@/types/users'
import { Button } from '@heroui/react'
import { ListFilter } from 'lucide-react'

type InitialProductsParams = {
    category?: string
    page?: string
    search?: string
}

const normalizeStoreCategory = (value?: string) => {
    const normalized = value?.trim()
    if (!normalized || normalized.toLowerCase() === 'all') return 'all'

    return normalized
}

export function ProductsTabs({
    user,
    initialProductsParams,
}: {
    user: User
    initialProductsParams?: InitialProductsParams
}) {
    const username = user.username || ''
    const initialCategory = normalizeStoreCategory(initialProductsParams?.category)
    const {
        activeCategory,
        page,
        search,
        categoryTouched,
        searchTouched,
        isFetchingNextPage,
        setPage,
        setSearch,
        setIsFetchingNextPage,
        updateProductsUrl,
    } = useCategoryTabsStore()
    const initialSearch = initialProductsParams?.search?.trim() || ''
    const effectiveSearch = searchTouched ? search : (search || initialSearch)
    const debouncedQuery = useDebounce(effectiveSearch)
    const activeCategoryForUI = categoryTouched
        ? activeCategory
        : activeCategory === 'all'
          ? initialCategory
          : activeCategory
    const activeFilter = activeCategoryForUI === 'all' ? '' : (activeCategoryForUI ?? '')
    const activeFilterForQuery = activeCategory === 'all' ? '' : (activeCategory ?? '')
    const { data, isLoading, fetchNextPage, hasNextPage } = useUserProducts(
        username,
        debouncedQuery,
        activeFilterForQuery,
        page
    )
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !effectiveSearch && !activeFilter

    const showSearchEmpty = isProductsEmpty && !!effectiveSearch

    const showCategoryEmpty = isProductsEmpty && !!activeFilter && !effectiveSearch

    const handleSearchChange = (value: string) => {
        setSearch(value, username)
    }

    const handleLoadMore = async () => {
        if (!hasNextPage || isFetchingNextPage) return

        const nextPage = page + 1

        setIsFetchingNextPage(true)
        try {
            await fetchNextPage({ throwOnError: true })
            setPage(nextPage)
            updateProductsUrl(username, nextPage, activeCategory)
        } finally {
            setIsFetchingNextPage(false)
        }
    }

    return (
        <div className='bg-background flex flex-col'>
            <div className='bg-background/90 supports-backdrop-filter:bg-background/90 sticky top-8.25 z-20 flex w-full flex-col-reverse items-center justify-between gap-1.5 px-1.5 py-1 backdrop-blur sm:flex-row'>
                <CategoryTabs username={user.username || ''} />
                <div className='ml-auto flex w-full items-center sm:max-w-[320px]'>
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
                                size='sm'
                                variant='ghost'
                            >
                                <ListFilter size={18} />
                            </Button>
                        }
                        value={effectiveSearch}
                        onChange={(event) => handleSearchChange(event.target.value)}
                    />
                </div>
            </div>
            <div className='p-2'>
                {showEmptyState && <PosEmptyState type='product' />}
                {showSearchEmpty && <PosEmptyState type='search' value={effectiveSearch} />}
                {showCategoryEmpty && <PosEmptyState type='category' value={activeFilter} />}
                {isLoading && <ProductGridSkeleton />}
                <ProductGrid products={data?.products || []} />
                {hasNextPage && (data?.products?.length ?? 0) > 0 && (
                    <div className='mt-4 flex justify-center'>
                        <Button
                            className='bg-default/10 border text-xs font-semibold'
                            isPending={isFetchingNextPage}
                            size='sm'
                            variant='secondary'
                            onPress={handleLoadMore}
                        >
                            {isFetchingNextPage ? 'Loading . . .' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}



