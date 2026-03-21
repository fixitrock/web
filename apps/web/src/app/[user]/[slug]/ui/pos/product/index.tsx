'use client'

import { Autocomplete, AutocompleteItem, ScrollShadow } from '@heroui/react'
import { useState } from 'react'

import { useDebounce } from '@/hooks'
import { usePosCategories, useSellerProducts } from '@/hooks/tanstack/query'
import { PosEmptyState } from '@/ui/empty'
import { Input } from '@/app/(space)/ui'

import { ProductGrid } from './card'
import { ProductGridSkeleton } from '../../products/skeleton'
import { cn } from '@/lib/utils'
type Props = {
    className?: string
}
export function PosProduct({ className }: Props): React.ReactNode {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data: cat } = usePosCategories()
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
                    size='sm'
                    classNames={{
                        inputWrapper:
                            'rounded-md border bg-transparent shadow-none group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent',

                        input: 'truncate overflow-hidden',
                        innerWrapper: 'px-1.5',
                    }}
                    hotKey='P'
                    placeholder='Search products . . .'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Autocomplete
                    placeholder='Select category'
                    size='sm'
                    className='sm:max-w-50'
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    allowsCustomValue
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-transparent shadow-none group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent border rounded-md',
                        },
                    }}
                    defaultItems={(cat?.categories || []).map((c) => ({ name: c }))}
                    selectedKey={category ?? undefined}
                    onSelectionChange={(key) => setCategory(key?.toString() ?? null)}
                >
                    {(c: any) => <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>}
                </Autocomplete>
            </div>

            <ScrollShadow hideScrollBar className='p-0.5'>
                {showEmptyState && <PosEmptyState type='product' />}
                {showSearchEmpty && <PosEmptyState type='search' value={query} />}
                {showCategoryEmpty && <PosEmptyState type='category' value={category} />}
                {isLoading && <ProductGridSkeleton />}
                <ProductGrid products={data?.products || []} />
            </ScrollShadow>
        </section>
    )
}
