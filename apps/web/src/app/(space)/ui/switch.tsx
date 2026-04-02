'use client'

import { Tabs } from '@heroui/react'
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
        <Tabs className='rounded-md p-1' selectedKey={layout} variant='secondary' onSelectionChange={(key) => handleChange(key as Layout)}>
            <Tabs.ListContainer>
                <Tabs.List aria-label='Layout Switcher' className='bg-background gap-1 p-0'>
                    {tabs.map((item) => (
                        <Tabs.Tab
                            key={item.layout}
                            id={item.layout}
                            aria-label={item.layout}
                            className='px-1 text-muted-foreground'
                        >
                            {item.icon}
                            <Tabs.Indicator className='bg-muted rounded shadow-none' />
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>
        </Tabs>
    )
}
