'use client'
import React, { useEffect } from 'react'
import { Badge, Button, Tab, Tabs } from '@heroui/react'
import { ArrowLeft, SearchIcon, ShoppingCart, X } from 'lucide-react'

import AnimatedSearch from '@/ui/farmer/search'
import { Command, CommandInput, CommandList } from '@/ui/command'
import { useSearchStore } from '@/zustand/store'
import { User as UserType } from '@/app/login/types'
import { tabs } from '@/config/tabs'
import { isAppleDevice, isWebKit } from '@react-aria/utils'

import { QuickAction } from './quick'
import { Space } from './space'
import { Navigations } from './type'
import { Downloads, Download } from './download'
import { Orders } from './orders'
import { Transactions } from './transactions'
import { useCartStore } from '@/zustand/store/cart'
export function SearchBar({
    user,
    children,
    command,
    balance,
}: {
    user: UserType | null
    children: React.ReactNode
    command: Record<string, Navigations> | null
    balance: { get: number; give: number }
}) {
    const {
        isOpen,
        onOpen,
        onClose,
        bounce,
        onKeyDown,
        query,
        page,
        setPage,
        setQuery,
        tab,
        setTab,
        shouldFilter,
        ref,
        heading,
        greeting,
        refreshGreeting,
        selectedTransaction,
        setSelectedTransaction,
    } = useSearchStore()
    const hasBackNavigation = Boolean(page || selectedTransaction)

    const { showCart, setShowCart, getTotalItems } = useCartStore()
    useEffect(() => {
        refreshGreeting(user?.name)
    }, [refreshGreeting, user?.name])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const hotkey = isAppleDevice() ? 'metaKey' : 'ctrlKey'

            if (e?.key?.toLowerCase() === 'k' && e[hotkey]) {
                e.preventDefault()
                if (isOpen) {
                    onClose()
                } else {
                    refreshGreeting(user?.name)
                    onOpen()
                }
            }
        }

        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [isOpen, onClose, onOpen, refreshGreeting, user?.name])

    return (
        <AnimatedSearch>
            <Command
                ref={ref}
                loop
                shouldFilter={shouldFilter}
                onKeyDown={onKeyDown}
                className='flex h-full flex-col'
            >
                <CommandInput
                    autoFocus={isOpen && !isWebKit()}
                    className={isOpen ? 'border-b' : ''}
                    endContent={
                        <>
                            <Download />
                            {user && getTotalItems() > 0 && (
                                <Badge
                                    color='danger'
                                    content={getTotalItems()}
                                    isInvisible={getTotalItems() === 0}
                                    shape='circle'
                                    size='sm'
                                >
                                    <Button
                                        isIconOnly
                                        className='bg-default/20'
                                        radius='full'
                                        size='sm'
                                        startContent={<ShoppingCart size={18} />}
                                        variant='light'
                                        onPress={() => setShowCart(!showCart)}
                                    />
                                </Badge>
                            )}
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
                    placeholder={heading() || greeting}
                    startContent={
                        <Button
                            isIconOnly
                            className={`${hasBackNavigation ? 'bg-default/20' : 'data-[hover=true]:bg-transparent'}`}
                            radius='full'
                            size='sm'
                            startContent={
                                hasBackNavigation ? <ArrowLeft size={18} /> : <SearchIcon size={18} />
                            }
                            variant={hasBackNavigation ? 'flat' : 'light'}
                            onPress={() => {
                                if (selectedTransaction) {
                                    setSelectedTransaction(null)
                                    bounce()
                                    return
                                }

                                if (page) {
                                    setPage(null)
                                    bounce()
                                }
                            }}
                        />
                    }
                    value={query}
                    onClick={() => {
                        if (!isOpen) {
                            refreshGreeting(user?.name)
                            onOpen()
                        }
                    }}
                    onValueChange={(value) => setQuery(value)}
                />
                {isOpen && (
                    <>
                        <CommandList>
                            {tab === 'actions' && <QuickAction command={command} />}
                            {tab === 'space' && <Space />}
                            {tab === 'orders' && user && <Orders />}
                            {tab === 'transactions' && user && <Transactions balance={balance} />}
                            {tab === 'downloads' && <Downloads />}
                        </CommandList>
                        <Tabs
                            classNames={{
                                base: 'p-1 px-1.5',
                                tabList: 'bg-accent relative w-full',
                                cursor: 'w-full',
                                tab: 'max-w-fit px-2 data-[focus-visible=true]:outline-0',
                            }}
                            selectedKey={tab}
                            radius='sm'
                            size='sm'
                            onSelectionChange={(key) => {
                                const selectedTab = tabs(user).find((t) => t.key === key)

                                if (!selectedTab) return
                                setTab(key as string)
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
            </Command>
        </AnimatedSearch>
    )
}
