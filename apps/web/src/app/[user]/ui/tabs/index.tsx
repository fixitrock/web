'use client'

import React, { useEffect } from 'react'
import { Tabs as HeroTabs } from '@heroui/react'
import { useRouter } from 'next/navigation'

import { useTabs } from '@/hooks/useTabs'
import { User } from '@/types/users'

type TabsProps = {
    user: User
    tabs: { title: string }[]
}

export default function Tabs({ user, tabs }: TabsProps) {
    const { selectedTab } = useTabs()
    const router = useRouter()
    const validTabKeys = React.useMemo(() => tabs.map((tab) => tab.title.toLowerCase()), [tabs])

    useEffect(() => {
        if (!validTabKeys.includes(selectedTab)) {
            router.replace(`/@${user.username}`)
        }
    }, [router, selectedTab, user.username, validTabKeys])

    if (!validTabKeys.includes(selectedTab)) {
        return null
    }

    return (
        <HeroTabs
            selectedKey={selectedTab}
            variant='secondary'
            onSelectionChange={(key) => {
                const tabKey = String(key)
                const href = tabKey === 'activity' ? `/@${user.username}` : `/@${user.username}?tab=${tabKey}`
                router.push(href)
            }}
        >
            <HeroTabs.ListContainer className='bg-background/90 sticky top-0 z-20 flex backdrop-blur'>
                <HeroTabs.List aria-label='Profile tabs' className='mb-1 w-full rounded-none border-b-1 p-0'>
                    {tabs.map((tab) => {
                        const tabKey = tab.title.toLowerCase()

                        return (
                            <HeroTabs.Tab
                                key={tabKey}
                                className='max-w-fit data-[focus-visible=true]:outline-none'
                                id={tabKey}
                            >
                                {tab.title}
                                <HeroTabs.Indicator className='w-full' />
                            </HeroTabs.Tab>
                        )
                    })}
                </HeroTabs.List>
            </HeroTabs.ListContainer>
        </HeroTabs>
    )
}
