'use client'

import type { ComponentPropsWithoutRef } from 'react'

import { Button, InputGroup, Tabs, useOverlayState } from '@heroui/react'

import { useMediaQuery } from '@/hooks'
import { useTransactions } from '@/hooks/tanstack/mutation'
import { logWarning } from '@/lib/utils'
import {
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerNested,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { useCartStore } from '@/zustand/store'

export type PaymentMethodType = 'cash' | 'upi' | 'card'

const modes: PaymentMethodType[] = ['cash', 'upi', 'card']

function formatINR(amount: number) {
    return `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

type PaymentModeProps = Omit<ComponentPropsWithoutRef<typeof Tabs>, 'children'>

function PaymentMode({ ...tabsProps }: PaymentModeProps) {
    return (
        <div>
            <h3 className='text-muted-foreground mb-1 text-sm font-medium'>Payment Method</h3>
            <Tabs variant='secondary' {...tabsProps}>
                <Tabs.ListContainer>
                    <Tabs.List aria-label='Payment Mode' className='w-full bg-default/15'>
                        {modes.map((mode) => (
                            <Tabs.Tab key={mode} className='flex-1 text-center' id={mode}>
                                {mode.toUpperCase()}
                                <Tabs.Indicator className='w-full' />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>
        </div>
    )
}

export function AddTransaction({ type }: { type: 'debit' | 'credit' }) {
    const overlayState = useOverlayState()
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const {
        transactions,
        setTransactionAmount,
        setTransactionNote,
        setTransactionMode,
        clearTransaction,
        selectedCustomer,
    } = useCartStore()
    const { addTransaction } = useTransactions()
    const transaction = transactions[type]

    const handlePlaceTransaction = async () => {
        if (!selectedCustomer) return
        if (!transaction.amount || transaction.amount <= 0) return

        try {
            await addTransaction.mutateAsync({
                userPhone: selectedCustomer.phone.toString(),
                amount: transaction.amount,
                type,
                notes: transaction.note,
                mode: transaction.mode,
            })
            clearTransaction(type)
            overlayState.close()
        } catch (error) {
            logWarning('Failed to add transaction', error)
        }
    }

    const accentClass = type === 'debit' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    const headlineClass =
        type === 'debit' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'

    const content = (
        <>
            <div className='my-2 space-y-3 p-2'>
                <InputGroup>
                    <InputGroup.Prefix>Rs</InputGroup.Prefix>
                    <InputGroup.Input
                        inputMode='numeric'
                        placeholder='Enter Amount'
                        type='number'
                        value={transaction.amount ? String(transaction.amount) : ''}
                        onChange={(event) => setTransactionAmount(type, Number(event.target.value))}
                    />
                </InputGroup>
                <PaymentMode
                    selectedKey={transaction.mode}
                    onSelectionChange={(mode) => setTransactionMode(type, mode as PaymentMethodType)}
                />
                <InputGroup>
                    <InputGroup.Input
                        placeholder='Enter Note (optional)'
                        value={transaction.note}
                        onChange={(event) => setTransactionNote(type, event.target.value)}
                    />
                </InputGroup>
            </div>
            <div className='border-t p-2'>
                <Button className={`w-full rounded-md ${accentClass}`} isPending={addTransaction.isPending} onPress={handlePlaceTransaction}>
                    {addTransaction.isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </>
    )

    if (isDesktop) {
        return (
            <Popover open={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
                <PopoverTrigger asChild>
                    <Button className={`w-full rounded ${accentClass}`}>
                        {type === 'debit' ? 'You Gave Rs' : 'You Got Rs'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align={type === 'debit' ? 'start' : 'center'}
                    className='w-78 p-0'
                    sideOffset={12}
                >
                    <h1 className={`line-clamp-1 truncate overflow-hidden border-b p-2 text-center font-mono text-lg font-semibold ${headlineClass}`}>
                        {type === 'debit'
                            ? `You gave ${formatINR(transaction.amount)} to ${selectedCustomer?.name}`
                            : `You got ${formatINR(transaction.amount)} from ${selectedCustomer?.name}`}
                    </h1>
                    {content}
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <DrawerNested open={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
            <DrawerTrigger asChild>
                <Button className={`w-full rounded ${accentClass}`}>
                    {type === 'debit' ? 'You Gave Rs' : 'You Got Rs'}
                </Button>
            </DrawerTrigger>
            <DrawerContent className='h-[80vh]'>
                <DrawerHeader className='border-b p-2'>
                    <DrawerTitle className={`line-clamp-1 truncate overflow-hidden text-center font-mono text-lg font-semibold ${headlineClass}`}>
                        {type === 'debit'
                            ? `You gave ${formatINR(transaction.amount)} to ${selectedCustomer?.name}`
                            : `You got ${formatINR(transaction.amount)} from ${selectedCustomer?.name}`}
                    </DrawerTitle>
                    <DrawerDescription aria-hidden />
                </DrawerHeader>
                <DrawerBody className='p-0'>{content}</DrawerBody>
                <DrawerFooter className='hidden' />
            </DrawerContent>
        </DrawerNested>
    )
}
