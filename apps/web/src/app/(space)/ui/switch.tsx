'use client'

import { Tab, Tabs } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useLayout, type Layout } from '@/zustand/store'
import { Grid, List } from '@/ui/icons'

export function SwitchLayout() {
    const { layout, setLayout } = useLayout()
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleChange = (nextLayout: Layout) => {
        setLayout(nextLayout, true)

        const params = new URLSearchParams(searchParams.toString())

        params.set('layout', nextLayout)
        router.replace(`?${params.toString()}`)
    }

    const tabs = [
        { layout: 'grid', icon: <Grid /> },
        { layout: 'list', icon: <List /> },
    ]

    return (
        <Tabs
            aria-label='Layout Switcher'
            classNames={{
                base: 'rounded-md p-1',
                tabContent: '!group-data-[selected=true]:text-muted-foreground',
                tabList: 'bg-background gap-1 p-0',
                tab: 'px-1',
                cursor: 'group-data-[selected=true]:bg-muted dark:group-data-[selected=true]:bg-muted shadow-none group-data-[selected=true]:rounded',
            }}
            selectedKey={layout}
            size='sm'
            variant='light'
            onSelectionChange={(key) => handleChange(key as Layout)}
        >
            {tabs.map((item) => (
                <Tab key={item.layout} aria-label={item.layout} title={item.icon} />
            ))}
        </Tabs>
    )
}
