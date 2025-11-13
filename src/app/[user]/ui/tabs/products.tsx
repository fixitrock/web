'use client'

import { useUserProducts, useUserCategories } from '@/hooks/tanstack/query'
import { ProductGrid } from '../../[slug]/ui/products/card'
import { ProductGridSkeleton } from '../../[slug]/ui/products/skeleton'
import { Button, Tabs, Tab, Image, Skeleton, ScrollShadow } from '@heroui/react'
import { PosEmptyState } from '@/ui/empty'
import { useRef, useState } from 'react'
import { useDebounce, useDragScroll } from '@/hooks'
import { Input } from '@/app/(space)/ui'
import { X } from 'lucide-react'
import React from 'react'
import { bucketUrl } from '@/supabase/bucket'

export function ProductsTabs({ username }: { username: string }) {
    const dragRef = useDragScroll<HTMLDivElement>()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const [category, setCategory] = useState<string | null>('All')
    const { data: cat, isLoading: catLoading } = useUserCategories(username)
    const { data, isLoading } = useUserProducts(username, debouncedQuery, category || '')
    const isProductsEmpty = !isLoading && data?.products.length === 0

    const showEmptyState = isProductsEmpty && !query && !category

    const showSearchEmpty = isProductsEmpty && !!query

    const showCategoryEmpty = isProductsEmpty && !!category && !query

    const combinedRef = (node: HTMLDivElement | null) => {
        containerRef.current = node
        if (node) {
            dragRef(node)
        }
    }

    return (
        <>
            <div className='bg-background sticky top-[45px] z-20 flex flex-col-reverse items-center justify-between gap-2 py-2 sm:flex-row'>
                <ScrollShadow
                    ref={combinedRef}
                    hideScrollBar
                    className='w-full'
                    orientation='horizontal'
                >
                    <Tabs
                        classNames={{
                            base: 'bg-background w-full py-0.5',
                            cursor: 'dark:bg-background rounded-full border shadow-none',
                        }}
                        items={cat?.categories}
                        variant='light'
                        size='lg'
                        selectedKey={category}
                        onSelectionChange={(key) => setCategory(String(key))}
                    >
                         {catLoading
                            ? Array.from({ length: 10 }).map((_, i) => (
                                  <Tab
                                      key={i}
                                      title={
                                          <div className='flex items-center justify-between gap-1.5'>
                                              <Skeleton className='size-6 rounded' />
                                              <Skeleton className='h-4 w-20 rounded' />
                                              <Skeleton className='ml-1 size-6 rounded-full' />
                                          </div>
                                      }
                                  />
                              ))
                            : cat?.categories.map((tab) => (
                                  <Tab
                                      key={tab.category}
                                      title={
                                          <div className='flex items-center justify-between gap-1.5'>
                                              <div className='size-6 overflow-hidden rounded'>
                                                  <Image
                                                      src={bucketUrl(
                                                          '/assets/categories/' +
                                                              tab.category
                                                                  .toLowerCase()
                                                                  .replace(/\s+/g, '-') +
                                                              '.png'
                                                      )}
                                                      alt={tab.category}
                                                      className='size-full rounded-none'
                                                  />
                                              </div>
                                              <span>{tab.category}</span>
                                              <span className='text-muted-foreground ml-1 text-xs'>
                                                  {tab.count}
                                              </span>
                                          </div>
                                      }
                                  />
                              ))}
                    </Tabs>
                </ScrollShadow>
                <div className='flex w-full items-center gap-2 sm:w-[50%] md:w-[40%] xl:w-[25%]'>
                    <Input
                        placeholder={
                            category && category !== 'all'
                                ? `Search ${category} . . .`
                                : 'Search Products . . .'
                        }
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
                </div>
            </div>
            {showEmptyState && <PosEmptyState type='product' />}
            {showSearchEmpty && <PosEmptyState type='search' value={query} />}
            {showCategoryEmpty && <PosEmptyState type='category' value={category} />}
            {isLoading && <ProductGridSkeleton />}
            <ProductGrid products={data?.products || []} />
        </>
    )
}
