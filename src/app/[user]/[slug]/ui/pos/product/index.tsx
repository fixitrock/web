'use client'

import { Autocomplete, AutocompleteItem, ScrollShadow } from '@heroui/react'
import { useState } from 'react'

import { useDebounce } from '@/hooks'
import { usePosCategories, useSellerProducts } from '@/hooks/tanstack/query'
import { PosEmptyState } from '@/ui/empty'
import { Input } from '@/app/(space)/ui'

import { ProductCard, ProductSkeleton } from './card'

export function PosProduct() {
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
            className='flex flex-1 flex-col gap-2 rounded-lg border p-2'
            data-slot='products'
        >
            <div className='flex flex-col items-center gap-2 sm:flex-row'>
                <Input
                    hotKey='P'
                    placeholder='Search products . . .'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Autocomplete
                    placeholder='Select category'
                    size='sm'
                    className='sm:max-w-[200px]'
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    allowsCustomValue
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-transparent group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent border',
                        },
                    }}
                    defaultItems={(cat?.categories || []).map((c) => ({ name: c }))}
                    selectedKey={category ?? undefined}
                    onSelectionChange={(key) => setCategory(key?.toString() ?? null)}
                >
                    {(c: any) => <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>}
                </Autocomplete>
            </div>

            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={category} />}

            <ScrollShadow hideScrollBar size={60}>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
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
            </ScrollShadow>
        </section>
    )
}
