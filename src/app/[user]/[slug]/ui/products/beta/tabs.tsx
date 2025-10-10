'use client'

import { ScrollShadow, Skeleton, Tab, Tabs } from '@heroui/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { useDragScroll } from '@/hooks'
import { useProductStore } from '@/zustand/product'

interface CategoryTabsProps {
    categories: string[]
    selected: string
    username: string
}

export function CategoryTabs({ categories, selected, username }: CategoryTabsProps) {
    const dragRef = useDragScroll<HTMLDivElement>()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const router = useRouter()

    const { activeCategory, setActiveCategory, handleCategoryChange, scrollActiveTabIntoView } =
        useProductStore()

    useEffect(() => {
        setActiveCategory(selected)
    }, [selected, setActiveCategory])

    useEffect(() => {
        scrollActiveTabIntoView(containerRef.current, activeCategory, selected)
    }, [activeCategory, selected, scrollActiveTabIntoView])

    const combinedRef = (node: HTMLDivElement | null) => {
        containerRef.current = node
        dragRef(node)
    }

    return (
        <ScrollShadow ref={combinedRef} hideScrollBar className='w-full' orientation='horizontal'>
            <Tabs
                aria-label='Category Tabs'
                classNames={{ cursor: 'bg-default/25 dark:bg-default/30 shadow-none' }}
                radius='full'
                selectedKey={activeCategory}
                size='md'
                variant='light'
                onSelectionChange={(key) => handleCategoryChange(key as string, username, router)}
            >
                <Tab key='all' title='All Products' />
                {categories.map((category) => (
                    <Tab key={category} title={category} />
                ))}
            </Tabs>
        </ScrollShadow>
    )
}

export function CategorySkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className='hide-scrollbar inline-flex w-full gap-2 overflow-x-auto p-1'>
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} className='h-8 w-26 shrink-0 rounded-full' />
            ))}
        </div>
    )
}
