'use client'

import { Tab, Tabs as UiTabs } from '@heroui/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { TabsConfig, User } from '@/app/login/types'
import { useTabs } from '@/hooks/useTabs'
import { Product } from '@/types/products'
import ProductsCard from '@/app/[user]/[slug]/ui/products/card'

import { Quotes } from './quotes'

type TabsProps = {
    user: User
    tabs: TabsConfig[]
    products: Product[]
    canManage: boolean
}
export default function Tabs({ user, tabs, products }: TabsProps) {
    const { tab } = useTabs()

    let selectedKey = 'activity'

    if (tab.includes('tab=')) {
        const match = tab.match(/tab=([^&]+)/)

        if (match && match[1]) selectedKey = match[1]
    }

    const validTabKeys = tabs.map((t) => t.title?.toLowerCase())

    if (selectedKey && !validTabKeys.includes(selectedKey)) {
        redirect(`/@${user.username}`)
    }

    return (
        <UiTabs
            classNames={{
                base: 'bg-background sticky top-0 z-20 w-full border-b-1 py-0.5',
            }}
            items={tabs}
            selectedKey={selectedKey}
            variant='underlined'
        >
            {tabs.map((tab) => {
                const tabKey = tab.title.toLowerCase()

                const href =
                    tabKey === 'activity'
                        ? `/@${user.username}`
                        : `/@${user.username}?tab=${tabKey}`

                return (
                    <Tab key={tabKey} as={Link} href={href} title={tab.title}>
                        {tab.component === 'ProductCard' ? (
                            <ProductsCard products={products} />
                        ) : tab.component === 'Quotes' ? (
                            <Quotes user={user} />
                        ) : (
                            <div className='text-muted-foreground flex h-80 w-full flex-col items-center justify-center text-center select-none'>
                                <span className='mb-2 animate-bounce text-6xl'>✨</span>
                                <span className='mb-1 text-2xl font-bold text-gray-700 dark:text-gray-200'>
                                    Something new is coming!
                                </span>
                                <span className='max-w-md text-base'>
                                    You found a new tab! We're working hard to make it amazing for
                                    you. Stay tuned! 💫
                                </span>
                            </div>
                        )}
                    </Tab>
                )
            })}
        </UiTabs>
    )
}
