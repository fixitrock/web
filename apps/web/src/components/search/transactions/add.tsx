'use client'
import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import type { ComponentPropsWithoutRef, KeyboardEvent as ReactKeyboardEvent } from 'react'

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
import { useCartStore, useSearchStore } from '@/zustand/store'

function stopSearchBarKeyHandling(event: ReactKeyboardEvent<HTMLElement>) {
    event.stopPropagation()
}

export function AddTransaction({ type }: { type: 'debit' | 'credit' }) {
    const { isOpen, onOpenChange, onClose } = useDisclosure()
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const {
        transactions,
        setTransactionAmount,
        setTransactionNote,
        setTransactionMode,
        clearTransaction,
    } = useCartStore()
    const { selectedTransaction } = useSearchStore()
    const { addTransaction } = useTransactions()

    const transaction = transactions[type]
    const amountValue = transaction.amount ? String(transaction.amount) : ''

    const handlePlaceTransaction = async () => {
        if (!selectedTransaction) return
        if (!transaction.amount || transaction.amount <= 0) return

        try {
            await addTransaction.mutateAsync({
                userPhone: selectedTransaction.phone.toString(),
                amount: transaction.amount,
                type,
                notes: transaction.note,
                mode: transaction.mode,
            })
            clearTransaction(type)
            onClose()
        } catch (error) {
            logWarning('Failed to add transaction', error)
        }
    }

    const title =
        type === 'debit'
            ? `You gave ${formatINR(transaction.amount)} to ${selectedTransaction?.name}`
            : `You got ${formatINR(transaction.amount)} from ${selectedTransaction?.name}`

    const amountInput = (
        <Input
            className='w-full rounded-[1px]'
            placeholder='Enter Amount'
            startContent='₹'
            type='number'
            value={amountValue}
            onChange={(e) => setTransactionAmount(type, Number(e.target.value))}
        />
    )

    const noteInput = (
        <Input
            className='w-full rounded-[1px]'
            placeholder='Enter Note (optional)'
            value={transaction.note}
            onChange={(e) => setTransactionNote(type, e.target.value)}
        />
    )

    const saveButton = (
        <Button
            className={`w-full rounded-md text-white ${
                type === 'debit' ? 'bg-red-500' : 'bg-green-500'
            }`}
            isLoading={addTransaction.isPending}
            onPress={handlePlaceTransaction}
        >
            {addTransaction.isPending ? 'Saving...' : 'Save'}
        </Button>
    )

    if (isDesktop) {
        return (
            <Popover isOpen={isOpen} shadow='none' onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full text-white`}
                    >
                        {type === 'debit' ? 'You Gave ₹' : 'You Got ₹'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='max-w-78 overflow-hidden border bg-background p-0'>
                    <div className='w-full' onKeyDown={stopSearchBarKeyHandling}>
                        <h1
                            className={`line-clamp-1 truncate overflow-hidden border-b p-2 text-center font-mono text-lg font-semibold ${
                                type === 'debit'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                            }`}
                        >
                            {title}
                        </h1>

                        <div className='my-2 space-y-3 p-2'>
                            {amountInput}
                            <PaymentMode
                                selectedKey={transaction.mode}
                                onSelectionChange={(mode) =>
                                    setTransactionMode(type, mode as PaymentMethodType)
                                }
                            />
                            {noteInput}
                        </div>

                        <div className='w-full border-t p-2'>{saveButton}</div>
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <DrawerNested open={isOpen} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button
                    size='sm'
                    className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full text-white`}
                >
                    {type === 'debit' ? 'You Gave ₹' : 'You Got ₹'}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div onKeyDown={stopSearchBarKeyHandling}>
                    <DrawerHeader className='border-b p-2'>
                        <DrawerTitle
                            className={`line-clamp-1 truncate overflow-hidden text-center font-mono text-lg font-semibold ${
                                type === 'debit'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                            }`}
                        >
                            {title}
                        </DrawerTitle>
                        <DrawerDescription aria-hidden />
                    </DrawerHeader>

                    <DrawerBody className='mt-2 space-y-3 p-2'>
                        {amountInput}
                        <PaymentMode
                            selectedKey={transaction.mode}
                            onSelectionChange={(mode) =>
                                setTransactionMode(type, mode as PaymentMethodType)
                            }
                        />
                        {noteInput}
                    </DrawerBody>

                    <DrawerFooter className='border-t p-2'>{saveButton}</DrawerFooter>
                </div>
            </DrawerContent>
        </DrawerNested>
    )
}

function formatINR(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const modes: PaymentMethodType[] = ['cash', 'upi', 'card']

type PaymentModeProps = Omit<ComponentPropsWithoutRef<typeof Tabs>, 'children' | 'key'>

function PaymentMode({ ...tabsProps }: PaymentModeProps) {
    return (
        <div>
            <h3 className='text-muted-foreground mb-1 text-sm font-medium'>Payment Method</h3>
            <Tabs
                classNames={{
                    cursor: 'bg-default/25 dark:bg-default/30 shadow-none',
                    tab: 'bg-default/15',
                }}
                radius='full'
                size='sm'
                title='Payment Mode'
                variant='light'
                onKeyDown={stopSearchBarKeyHandling}
                {...tabsProps}
            >
                {modes.map((mode) => (
                    <Tab key={mode} title={mode.toUpperCase()} value={mode} />
                ))}
            </Tabs>
        </div>
    )
}

export type PaymentMethodType = 'cash' | 'upi' | 'card'
