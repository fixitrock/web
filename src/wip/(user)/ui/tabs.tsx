'use client'

import { Tab, Tabs as UiTabs } from '@heroui/react'

import { useTabs } from '@/hooks/useTabs'

import { Memoirs } from '../rockstar/(memoirs)/ui'

import { Quotes } from './quotes'
import { Activity } from './activity'

export default function Tabs() {
    const { selectedTab } = useTabs()

    return (
        <UiTabs
            classNames={{
                base: 'bg-background sticky top-0 z-20 w-full border-b py-0.5',
            }}
            selectedKey={selectedTab}
            variant='underlined'
        >
            <Tab key='/rockstar' href='/rockstar' title='Activity'>
                <Activity />
            </Tab>
            <Tab key='/rockstar?tab=quotes' href='/rockstar?tab=quotes' title='Quotes'>
                <Quotes />
            </Tab>
            <Tab key='/rockstar?tab=memoirs' href='/rockstar?tab=memoirs' title='Memoirs'>
                <Memoirs />
            </Tab>
        </UiTabs>
    )
}
