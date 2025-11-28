'use client'
import { Tab, Tabs as UiTabs } from '@heroui/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { TabsConfig, User } from '@/app/login/types'
import { useTabs } from '@/hooks/useTabs'
import { Product } from '@/types/products'

import { Quotes } from './quotes'
import { ProductsTabs } from './products'
import { ActivityTab } from './activity'
import { useMounted } from '@/hooks'

type TabsProps = {
    user: User
    tabs: TabsConfig[]
    products: Product[]
    canManage: boolean
}

export default function Tabs({ user, tabs, canManage }: TabsProps) {
    const { selectedTab } = useTabs()
    const { mounted } = useMounted()
    
    const validTabKeys = tabs.map((t) => t.title.toLowerCase())
    if (!validTabKeys.includes(selectedTab)) {
        redirect(`/@${user.username}`)
    }
    return (
        <UiTabs
           disableAnimation={!mounted}
            classNames={{
                tabList: 'border-b-1.5 relative w-full rounded-none p-0',
                cursor: 'w-full',
                tab: 'max-w-fit',
                base: 'bg-background/90 sticky top-0 z-20 flex backdrop-blur',
                panel: 'py-0 pb-3 data-[focus-visible=true]:outline-none',
            }}
            items={tabs}
            selectedKey={selectedTab ?? undefined}
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
                            <ProductsTabs username={user.username} />
                        ) : tab.component === 'Quotes' ? (
                            <Quotes user={user} />
                        ) : tab.component === 'Activity' ? (
                            <ActivityTab user={user} canManage={canManage} />
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
