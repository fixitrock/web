'use client'
import React from 'react'
import { Button, Tab, Tabs } from '@heroui/react'
import { ArrowLeft, SearchIcon, X } from 'lucide-react'

import AnimatedSearch from '@/ui/farmer/search'
import { Command, CommandInput, CommandList } from '@/ui/command'
import { useSearchStore } from '@/zustand/store'
import { User as UserType } from '@/app/login/types'
import { HeyYou } from '@/lib/utils'
import { tabs } from '@/config/tabs'

import { QuickAction } from './quick'
import { Space } from './space'
import { Navigations } from './type'
import { Downloads, Download } from './download'
import { Orders } from './orders'
export function SearchBar({
    user,
    children,
    command,
}: {
    user: UserType | null
    children: React.ReactNode
    command: Record<string, Navigations> | null
}) {
    const {
        open,
        setOpen,
        bounce,
        onKeyDown,
        query,
        page,
        setPage,
        setQuery,
        tab,
        setTab,
        shouldFilter,
        setShouldFilter,
        ref,
        heading,
    } = useSearchStore()

    return (
        <AnimatedSearch open={open} setOpen={setOpen}>
            <Command
                ref={ref}
                loop
                className={
                    open
                        ? 'md:bg-background/80 h-full md:h-[50vh] md:rounded-lg md:border md:backdrop-blur'
                        : 'bg-background/80 rounded-xl border backdrop-blur'
                }
                shouldFilter={shouldFilter}
                onKeyDown={onKeyDown}
            >
                {open && (
                    <>
                        <CommandList>
                            {tab === 'actions' && <QuickAction command={command} />}
                            {tab === 'space' && <Space />}
                            {tab === 'orders' && user && <Orders />}
                            {tab === 'downloads' && <Downloads />}
                        </CommandList>

                        <Tabs
                            classNames={{
                                tabList: 'relative w-full rounded-none border-y p-0',
                                cursor: 'w-full',
                                tab: 'h-10 max-w-fit px-2 data-[focus-visible=true]:outline-0',
                            }}
                            selectedKey={tab}
                            size='sm'
                            variant='underlined'
                            onSelectionChange={(key) => {
                                const selectedTab = tabs(user).find((t) => t.key === key)

                                if (!selectedTab) return
                                setTab(key as string)
                                setShouldFilter(selectedTab.shouldFilter)
                            }}
                        >
                            {tabs(user).map((tab) => (
                                <Tab
                                    key={tab.key}
                                    title={
                                        <div className='flex items-center space-x-1'>
                                            <tab.icon />
                                            <span>{tab.title}</span>
                                        </div>
                                    }
                                />
                            ))}
                        </Tabs>
                    </>
                )}
                <CommandInput
                    className={open ? 'border-b md:border-b-0' : ''}
                    endContent={
                        <>
                            <Download />
                            {query ? (
                                <Button
                                    isIconOnly
                                    className='bg-default/20'
                                    radius='full'
                                    size='sm'
                                    startContent={<X size={18} />}
                                    variant='light'
                                    onPress={() => setQuery('')}
                                />
                            ) : (
                                children
                            )}
                        </>
                    }
                    placeholder={heading() || (user ? HeyYou(user?.name) : 'What do you need?')}
                    startContent={
                        <Button
                            isIconOnly
                            className={`${page ? 'bg-default/20' : 'data-[hover=true]:bg-transparent'}`}
                            radius='full'
                            size='sm'
                            startContent={page ? <ArrowLeft size={18} /> : <SearchIcon size={18} />}
                            variant={page ? 'flat' : 'light'}
                            onPress={() => {
                                if (page) {
                                    setPage(null)
                                    bounce()
                                }
                            }}
                        />
                    }
                    value={query}
                    onFocus={() => setOpen(true)}
                    onValueChange={(value) => setQuery(value)}
                />
            </Command>
        </AnimatedSearch>
    )
}
