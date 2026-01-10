'use client'
import { useDragScroll } from '@/hooks'
import { useUserCategories } from '@/hooks/tanstack/query'
import { bucketUrl } from '@/supabase/bucket'
import { useCategoryTabsStore } from '@/zustand/store'
import { ScrollShadow, Skeleton, Tab, Tabs, Image } from '@heroui/react'
import { useEffect, useRef } from 'react'

export function CategoryTabs({ username }: { username: string }) {
    const dragRef = useDragScroll<HTMLDivElement>()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { data, isLoading } = useUserCategories(username)
    const { activeCategory, setActiveCategory, handleCategoryChange } = useCategoryTabsStore()
    useEffect(() => {
        if (!isLoading && data?.categories && data?.categories.length > 0) {
            const exists = data.categories.some((c) => c.category === activeCategory)
            if (!exists) {
                setActiveCategory(data.categories[0].category)
            }
        }
    }, [data, isLoading, activeCategory, setActiveCategory])

    const combinedRef = (node: HTMLDivElement | null) => {
        containerRef.current = node
        dragRef(node)
    }

    return (
        <ScrollShadow ref={combinedRef} hideScrollBar className='w-full' orientation='horizontal'>
            <Tabs
                ref={combinedRef}
                classNames={{
                    base: 'bg-transparent py-0',
                    cursor: 'dark:bg-default/20 rounded-md border shadow-none',
                    tabList: 'gap-2 p-0 px-1',
                }}
                items={data?.categories}
                variant='light'
                selectedKey={activeCategory}
                onSelectionChange={(key) => handleCategoryChange(String(key))}
            >
                {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                          <Tab
                              key={i}
                              title={
                                  <div className='flex items-center justify-between gap-1'>
                                      <Skeleton className='size-6 rounded' />
                                      <Skeleton className='h-4 w-16 rounded' />
                                      <Skeleton className='size-6 rounded-full' />
                                  </div>
                              }
                          />
                      ))
                    : data?.categories.map((tab) => (
                          <Tab
                              key={tab.category}
                              data-key={tab.category}
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
                                              loading='lazy'
                                          />
                                      </div>
                                      <span className='font-medium'>{tab.category}</span>
                                      <span className='text-muted-foreground bg-default-100 rounded-full px-2 py-0.5 text-xs'>
                                          {tab.count}
                                      </span>
                                  </div>
                              }
                          />
                      ))}
            </Tabs>
        </ScrollShadow>
    )
}
