'use client'
import { useEffect } from 'react'
import { useCartStore, useSearchStore } from '../store'
import { Navigations, User } from '../types'
import { Command } from 'cmdk'

// import { isAppleDevice } from '@react-aria/utils'
import { useMediaQuery } from '../hooks'
import { Button, CloseButton, Drawer, Modal } from '@heroui/react'
import { ArrowLeft, SearchIcon } from 'lucide-react'
export function SearchBar({
    user,
    children,
    command,
    balance,
}: {
    user: User | null
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
    const showTransactionActions = Boolean(
        isOpen && tab === 'transactions' && selectedTransaction && transactionSeller
    )

    useEffect(() => {
        refreshGreeting(user?.name)
    }, [refreshGreeting, user?.name])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const hotkey = navigator.platform.includes('Mac') ? 'metaKey' : 'ctrlKey'

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
        <Command ref={ref} shouldFilter={shouldFilter} onKeyDown={onKeyDown}>
            <ModalDrawer user={user} />
        </Command>
    )
}

function ModalDrawer({ user }: { user: User | null }) {
    const { isOpen, onClose, ref } = useSearchStore()
    const isDesktop = useMediaQuery('(min-width: 768px)')
    return (
        <>
            {!isOpen && (
                <div
                    className={`bg-default fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-full p-1 px-2 md:w-160`}
                >
                    <Input user={user} />
                </div>
            )}

            {isDesktop ? (
                <Modal.Backdrop ref={ref} isOpen={isOpen} onOpenChange={onClose}>
                    <Modal.Container>
                        <Modal.Dialog className='sm:max-w-[360px]'>
                            <Modal.Header>
                                <Input user={user} />
                            </Modal.Header>
                            <Modal.Body>items</Modal.Body>
                            <Modal.Footer>footer</Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            ) : (
                <Drawer.Backdrop ref={ref} isOpen={isOpen} onOpenChange={onClose}>
                    <Drawer.Content placement='right'>
                        <Drawer.Dialog>
                            <Drawer.CloseTrigger />
                            <Drawer.Header>
                                <Input user={user} />
                            </Drawer.Header>
                            <Drawer.Body>itmes</Drawer.Body>
                            <Drawer.Footer>footer</Drawer.Footer>
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            )}
        </>
    )
}

function Input({ user, userDrawer }: { user: User | null; userDrawer?: React.ReactNode }) {
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
    return (
        <div
            className='flex w-full flex-1 items-center space-x-2 px-2 py-1'
            data-slot='command-input-wrapper'
        >
            <Button
                isIconOnly
                size='sm'
                variant={hasBackNavigation ? 'outline' : 'ghost'}
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
                {hasBackNavigation ? <ArrowLeft size={16} /> : <SearchIcon size={16} />}
            </Button>
            <Command.Input
                className='placeholder:text-foreground-500 text-medium flex flex-1 bg-transparent bg-clip-text font-normal outline-hidden placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50'
                placeholder={heading() || greeting}
                value={query}
                onClick={() => {
                    if (!isOpen) {
                        refreshGreeting(user?.name)
                        onOpen()
                    }
                }}
                onValueChange={(value) => setQuery(value)}
                autoFocus={isOpen}
            />
            <>
                {/* <Download /> */}
                {/* {user && getTotalItems() > 0 && (
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
                            )} */}
                {query ? <CloseButton onPress={() => setQuery('')} /> : userDrawer}
            </>
        </div>
    )
}

function List() {
    return <Command.List>hey</Command.List>
}