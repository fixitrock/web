'use client'
import { Button, Skeleton, useDisclosure, User } from '@heroui/react'
import { TbTransactionRupee } from 'react-icons/tb'

import { useMediaQuery } from '@/hooks'
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
} from '@/ui/drawer'
import { useCartStore } from '@/zustand/store'
import { useTransactions } from '@/hooks/tanstack/query/order'

import { NoTransactionMessage, TransactionCard, TransactionSkeleton } from './card'
import { AddTransaction } from './add'

export function UserTransaction() {
    const { isOpen, onOpenChange, onOpen } = useDisclosure()
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const { selectedCustomer } = useCartStore()
    const { data, isLoading } = useTransactions(
        selectedCustomer?.phone ? Number(selectedCustomer.phone) : 0
    )

    return (
        <>
            <Button
                isIconOnly
                aria-label='User Transactions History'
                className='bg-default/20'
                data-slot='user-transaction-button'
                isDisabled={!selectedCustomer}
                radius='full'
                size='sm'
                startContent={<TbTransactionRupee size={20} />}
                variant='light'
                onPress={onOpen}
            />

            <Drawer
                data-slot='user-transaction-drawer'
                direction={isDesktop ? 'right' : 'bottom'}
                open={isOpen}
                onOpenChange={onOpenChange}
            >
                <DrawerContent
                    className='h-[90vh] md:h-full'
                    data-slot='user-transaction-drawer-content'
                    hideCloseButton={isDesktop}
                    showbar={!isDesktop}
                >
                    <DrawerHeader className='border-b p-2'>
                        <User
                            avatarProps={{
                                // src: userAvatar(user),
                                fallback: selectedCustomer?.name?.charAt(0) || '',
                                className: 'size-10',
                            }}
                            classNames={{
                                base: 'flex justify-start px-2 sm:px-0',
                                name: 'text-md flex items-center gap-1',
                            }}
                            description={selectedCustomer?.phone.slice(2)}
                            name={selectedCustomer?.name}
                        />
                        <DrawerTitle aria-hidden />
                        <DrawerDescription aria-hidden />
                    </DrawerHeader>
                    <DrawerBody className='space-y-2 p-2'>
                        <BalanceCard as='seller' balance={data?.balance} isLoading={isLoading} />
                        {isLoading && <TransactionSkeleton />}
                        {data?.empty && <NoTransactionMessage />}
                        <TransactionCard transactions={data?.transactions} />
                    </DrawerBody>
                    <DrawerFooter className='flex-row gap-4 border-t p-2'>
                        <AddTransaction type='debit' />
                        <AddTransaction type='credit' />
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

type BalanceMessageProps = {
    balance?: {
        total_credit: number
        total_debit: number
    }
    isLoading?: boolean
    as: 'seller' | 'user'
}

function formatINR(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function BalanceCard({ balance, isLoading, as }: BalanceMessageProps) {
    const total_credit = balance?.total_credit || 0
    const total_debit = balance?.total_debit || 0

    let net = 0

    if (as === 'seller') {
        net = total_debit - total_credit
    } else {
        net = total_credit - total_debit
    }
    let message = ''
    let textColor = ''

    if (net > 0) {
        message = 'You will get'
        textColor = 'text-red-500'
    } else if (net < 0) {
        message = 'You will give'
        textColor = 'text-green-500'
    } else {
        message = 'All Settled'
        textColor = ''
    }

    return (
        <div className='flex items-center justify-between rounded border p-2 font-medium'>
            {isLoading ? (
                <>
                    <Skeleton className='h-5 w-30 rounded' />
                    <Skeleton className='h-5 w-20 rounded' />
                </>
            ) : (
                <>
                    <span>{message}</span>
                    <span className={`${textColor}`}>{formatINR(Math.abs(net))}</span>
                </>
            )}
        </div>
    )
}
