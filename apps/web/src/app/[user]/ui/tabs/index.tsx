'use client'
import { Tab, Tabs as UiTabs } from '@heroui/react'
import Link from 'next/link'
import { useTabs } from '@/hooks/useTabs'
import { useMounted } from '@/hooks'
import { User } from '@/types/users'
import { useRouter } from 'next/navigation'
import React from 'react'

type TabsProps = {
    user: User
    tabs: { title: string }[]
}

export default function Tabs({ user, tabs }: TabsProps) {
    const { selectedTab } = useTabs()
    const { mounted } = useMounted()
    const router = useRouter()
    const validTabKeys = React.useMemo(() => tabs.map((t) => t.title.toLowerCase()), [tabs])
    if (!validTabKeys.includes(selectedTab)) {
        router.replace(`/@${user.username}`)
        return null
    }

    return (
        <UiTabs
            disableAnimation={!mounted}
            selectedKey={selectedTab}
            variant='underlined'
            classNames={{
                tabList: 'relative mb-1 w-full rounded-none border-b-1 p-0',
                cursor: 'w-full',
                tab: 'max-w-fit',
                base: 'bg-background/90 sticky top-0 z-20 flex backdrop-blur',
                panel: 'py-0 data-[focus-visible=true]:outline-none',
            }}
        >
            {tabs.map((tab) => {
                const tabKey = tab.title.toLowerCase()
                const href =
                    tabKey === 'activity'
                        ? `/@${user.username}`
                        : `/@${user.username}?tab=${tabKey}`

                return <Tab key={tabKey} as={Link} href={href} title={tab.title} />
            })}
        </UiTabs>
    )
}
