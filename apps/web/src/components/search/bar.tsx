'use client'
import React, { useEffect } from 'react'
import { Badge, Button, Tabs } from '@heroui/react'
import { ArrowLeft, SearchIcon, ShoppingCart, X } from 'lucide-react'

import AnimatedSearch from '@/ui/farmer/search'
import { Command, CommandInput, CommandList } from '@/ui/command'
import { useSearchStore } from '@/zustand/store'
import { User as UserType } from '@/app/login/types'
import { tabs } from '@/config/tabs'
import { isAppleDevice } from '@react-aria/utils'

import { QuickAction } from './quick'
import { Space } from './space'
import { Navigations } from './type'
import { Downloads, Download } from './download'
import { Orders } from './orders'
import { Transactions } from './transactions'
import { AddTransaction } from './transactions/add'
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
        transactionSeller,
    } = useSearchStore()
    const hasBackNavigation = Boolean(page || selectedTransaction)

    const { showCart, setShowCart, getTotalItems } = useCartStore()
    const cartItems = getTotalItems()
    const showTransactionActions = Boolean(
        isOpen && tab === 'transactions' && selectedTransaction && transactionSeller
    )

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
                shouldFilter={shouldFilter}
                onKeyDown={onKeyDown}
                className='flex h-full flex-col'
            >
                <CommandInput
                    autoFocus={isOpen}
                    className={isOpen ? 'border-b' : ''}
                    endContent={
                        <>
                            <Download />
                            {user && cartItems > 0 && (
                                <Badge color='danger' size='sm'>
                                    <Badge.Anchor>
                                        <Button
                                            isIconOnly
                                            className='bg-default/20 rounded-full'
                                            size='sm'
                                            variant='ghost'
                                            onPress={() => setShowCart(!showCart)}
                                        >
                                            <ShoppingCart size={18} />
                                        </Button>
                                    </Badge.Anchor>
                                    <Badge.Label>{String(cartItems)}</Badge.Label>
                                </Badge>
                            )}
                            {query ? (
                                <Button
                                    isIconOnly
                                    className='bg-default/20 rounded-full'
                                    size='sm'
                                    variant='ghost'
                                    onPress={() => setQuery('')}
                                >
                                    <X size={18} />
                                </Button>
                            ) : (
                                children
                            )}
                        </>
                    }
                    placeholder={heading() || greeting}
                    startContent={
                        <Button
                            isIconOnly
                            className={`${hasBackNavigation ? 'bg-default/20' : 'data-[hover=true]:bg-transparent'} rounded-full`}
                            size='sm'
                            variant={hasBackNavigation ? 'secondary' : 'ghost'}
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
                        >
                            {hasBackNavigation ? <ArrowLeft size={18} /> : <SearchIcon size={18} />}
                        </Button>
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

                        {showTransactionActions && (
                            <div className='flex items-center justify-end gap-3 px-4 pb-0.5 md:gap-3'>
                                <AddTransaction type='credit' />
                                <AddTransaction type='debit' />
                            </div>
                        )}

                        {!selectedTransaction && (
                            <Tabs
                                className='p-1 px-1.5'
                                selectedKey={tab}
                                variant='secondary'
                                onSelectionChange={(key) => {
                                    const selectedTab = tabs(user).find((t) => t.key === key)

                                    if (!selectedTab) return
                                    setTab(key as string)
                                }}
                            >
                                <Tabs.ListContainer>
                                    <Tabs.List aria-label='Search tabs' className='bg-accent relative w-full'>
                                        {tabs(user).map((tabItem) => (
                                            <Tabs.Tab
                                                key={tabItem.key}
                                                id={tabItem.key}
                                                className='max-w-fit px-2 data-[focus-visible=true]:outline-0'
                                            >
                                                <div className='flex items-center space-x-1'>
                                                    <tabItem.icon />
                                                    <span>{tabItem.title}</span>
                                                </div>
                                                <Tabs.Indicator className='w-full' />
                                            </Tabs.Tab>
                                        ))}
                                    </Tabs.List>
                                </Tabs.ListContainer>
                            </Tabs>
                        )}
                    </>
                )}
            </Command>
        </AnimatedSearch>
    )
}
