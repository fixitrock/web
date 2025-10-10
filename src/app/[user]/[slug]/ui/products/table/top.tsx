'use client'

import { Chip, ScrollShadow } from '@heroui/react'
import React from 'react'

import { FilterIcon } from '@/ui/icons'
import { Input } from '@/app/(space)/ui'
import { useDragScroll } from '@/hooks'
import { Product } from '@/types/product'

import { Filter } from './filter'
import ExportButton from './export'

type TopContentProps = {
    activeFilters: Array<{
        id: string
        label: string
        onRemove: () => void
    }> | null
    brands: string[]
    categories: string[]
    status: Array<{ key: string; label: string }>
    searchTerm: string
    setSearchTerm: (value: string) => void
    reset: () => void
    columns: Array<{ key: string; label: string }>
    selectedProducts: Set<string>
    products: Product[]
}

export function TopContent({
    activeFilters,
    brands,
    categories,
    status,
    searchTerm,
    setSearchTerm,
    reset,
    columns,
    products,
    selectedProducts,
}: TopContentProps) {
    const drag = useDragScroll<HTMLDivElement>()

    return (
        <div className='grid items-center gap-3 p-3 md:grid-cols-2'>
            {activeFilters && activeFilters.length > 0 ? (
                <div className='order-2 flex gap-1.5 overflow-auto md:order-1'>
                    <ScrollShadow
                        ref={drag}
                        hideScrollBar
                        className='flex gap-1.5'
                        orientation='horizontal'
                    >
                        {activeFilters.map((filter) => (
                            <Chip
                                key={filter.id}
                                className='select-none'
                                size='sm'
                                variant='flat'
                                onClose={filter.onRemove}
                            >
                                {filter.label}
                            </Chip>
                        ))}
                    </ScrollShadow>
                    <Chip
                        className='cursor-pointer text-white select-none'
                        color='danger'
                        size='sm'
                        startContent={<FilterIcon className='size-4' />}
                        onClick={() => reset()}
                    >
                        Clear
                    </Chip>
                </div>
            ) : (
                <span className='hidden sm:flex' />
            )}

            <div className='order-1 flex items-center justify-end gap-2 md:order-2'>
                <Input
                    className='md:w-fit'
                    hotKey='P'
                    placeholder={`Search products . . .`}
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                />
                <Filter brands={brands} categories={categories} columns={columns} status={status} />
                {selectedProducts.size > 0 && (
                    <ExportButton products={products} selectedProducts={selectedProducts} />
                )}
            </div>
        </div>
    )
}
