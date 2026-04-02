'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { ScrollShadow, Skeleton, Tabs } from '@heroui/react'

import { useDragScroll } from '@/hooks'
import { useUserCategories } from '@/hooks/tanstack/query'
import { bucketUrl } from '@/supabase/bucket'
import { useCategoryTabsStore } from '@/zustand/store'

export function CategoryTabs({ username }: { username: string }) {
    const dragRef = useDragScroll<HTMLDivElement>()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { data, isLoading } = useUserCategories(username)
    const { activeCategory, handleCategoryChange } = useCategoryTabsStore()

    const combinedRef = (node: HTMLDivElement | null) => {
        containerRef.current = node
        dragRef(node)
    }

    const availableKeys = data?.top?.map((item) => item.category) ?? []
    const selectedKey = availableKeys.includes(activeCategory || '') ? (activeCategory as string) : (availableKeys[0] ?? 'all')

    return (
        <ScrollShadow ref={combinedRef} hideScrollBar className='w-full' orientation='horizontal'>
            <Tabs selectedKey={selectedKey} variant='secondary' onSelectionChange={(key) => handleCategoryChange(String(key), username)}>
                <Tabs.ListContainer className='bg-transparent py-0'>
                    <Tabs.List aria-label='Categories' className='gap-2 p-0 px-1'>
                        {isLoading
                            ? Array.from({ length: 10 }).map((_, index) => (
                                  <Tabs.Tab key={index} className='rounded-2xl border shadow-none' id={`skeleton-${index}`}>
                                      <div className='flex items-center justify-between gap-1'>
                                          <Skeleton className='size-6 rounded' />
                                          <Skeleton className='h-4 w-16 rounded' />
                                          <Skeleton className='size-6 rounded-full' />
                                      </div>
                                      <Tabs.Indicator className='w-full' />
                                  </Tabs.Tab>
                              ))
                            : data?.top.map((tab) => (
                                  <Tabs.Tab key={tab.category} className='rounded-2xl border shadow-none' id={tab.category}>
                                      <div className='flex items-center justify-between gap-1.5'>
                                          <div className='size-6 overflow-hidden rounded'>
                                              <Image
                                                  alt={tab.category}
                                                  height={100}
                                                  quality={100}
                                                  src={bucketUrl(`/assets/categories/${tab.category.toLowerCase().replace(/\s+/g, '-')}.png`)}
                                                  width={100}
                                              />
                                          </div>
                                          <span className='font-medium'>{tab.category}</span>
                                          <span className='text-muted-foreground bg-default-100 rounded-full px-2 py-0.5 text-xs'>
                                              {tab.count}
                                          </span>
                                      </div>
                                      <Tabs.Indicator className='w-full' />
                                  </Tabs.Tab>
                              ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>
        </ScrollShadow>
    )
}
