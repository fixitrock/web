'use client'

import { useUserProducts } from '@/hooks/tanstack/query'
import { ProductGrid } from '../../[slug]/ui/products/card'
import { ProductGridSkeleton } from '../../[slug]/ui/products/skeleton'
import { Autocomplete, AutocompleteItem, Button } from '@heroui/react'
import { PosEmptyState } from '@/ui/empty'
import { useState } from 'react'
import { useDebounce } from '@/hooks'
import { Input } from '@/app/(space)/ui'
import { X } from 'lucide-react'
import { useFilter } from '@react-aria/i18n'
import React from 'react'

export function ProductsTabs({ username }: { username: string }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>(null)
    const { data, isLoading } = useUserProducts(username, debouncedQuery, category || '')
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !category

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!category && !query

    const [fieldState, setFieldState] = React.useState<{
        selectedKey: string | null
        inputValue: string
        items: Array<{ category: string; count: number }>
    }>({
        selectedKey: null,
        inputValue: '',
        items: data?.categories || [],
    })

    const { startsWith } = useFilter({ sensitivity: 'base' })

    const onSelectionChange = (key: React.Key | null) => {
        const keyString = key?.toString() || null
        setFieldState((prevState) => {
            let selectedItem = prevState?.items?.find((option) => option.category === keyString)

            setCategory(selectedItem?.category || null)

            return {
                inputValue: selectedItem?.category || '',
                selectedKey: keyString,
                items:
                    data?.categories?.filter((item) =>
                        startsWith(item.category, selectedItem?.category || '')
                    ) || [],
            }
        })
    }

    const onInputChange = (value: string) => {
        setFieldState((prevState) => ({
            inputValue: value,
            selectedKey: value === '' ? null : prevState.selectedKey,
            items: data?.categories?.filter((item) => startsWith(item.category, value)) || [],
        }))
    }

    return (
        <>
            <div className='bg-background sticky top-[45px] z-20 flex flex-col items-center justify-between gap-2 py-2 sm:flex-row'>
                <Input
                    placeholder='Search Products . . . '
                    hotKey='P'
                    value={query}
                    onValueChange={(value) => setQuery(value)}
                    end={
                        query && (
                            <Button
                                isIconOnly
                                className='bg-default/20 h-6.5 w-6.5 min-w-auto border-1 p-0'
                                radius='full'
                                size='sm'
                                startContent={<X size={18} />}
                                variant='light'
                                onPress={() => setQuery('')}
                            />
                        )
                    }
                />
                <Autocomplete
                    isLoading={isLoading}
                    placeholder='Select category'
                    size='sm'
                    className='sm:max-w-[200px]'
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-transparent group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent border',
                        },
                    }}
                    inputValue={fieldState.inputValue}
                    items={fieldState.items ?? []}
                    selectedKey={fieldState.selectedKey ?? undefined}
                    onInputChange={onInputChange}
                    onSelectionChange={onSelectionChange}
                >
                    {(item) => (
                        <AutocompleteItem key={item.category} textValue={item.category}>
                            {item.category}{' '}
                            <span className='text-muted-foreground ml-1 text-xs'>{item.count}</span>
                        </AutocompleteItem>
                    )}
                </Autocomplete>
            </div>
            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={category} />}
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
        </>
    )
}
