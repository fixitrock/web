'use client'
import { Tab, Tabs as UiTabs } from '@heroui/react'
import Link from 'next/link'
import { useTabs } from '@/hooks/useTabs'
import { useMounted } from '@/hooks'
import { User } from '@/types/users'

type TabsProps = {
    user: User
    tabs: { title: string }[]
}

export default function Tabs({ user, tabs }: TabsProps) {
    const { selectedTab } = useTabs()
    const { mounted } = useMounted()

    const validTabKeys = tabs.map((t) => t.title.toLowerCase())
    if (!validTabKeys.includes(selectedTab)) {
        window.location.href = `/@${user.username}`
        return null
    }

    return (
        <UiTabs
            disableAnimation={!mounted}
            selectedKey={selectedTab}
            variant='underlined'
            classNames={{
                tabList: 'border-b-1.5 relative w-full rounded-none p-0',
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
