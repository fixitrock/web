'use client'
import { Button, Input, Tabs, Tab, useDisclosure, TabsProps } from '@heroui/react'

import { useMediaQuery } from '@/hooks'
import { useCartStore } from '@/zustand/store'
import { useTransactions } from '@/hooks/tanstack/mutation'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import {
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerNested,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer'
import { logWarning } from '@/lib/utils'

export function AddTransaction({ type }: { type: 'debit' | 'credit' }) {
    const { isOpen, onOpenChange, onClose } = useDisclosure()
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
            onClose()
        } catch (error) {
            logWarning('Failed to add transaction', error)
        }
    }

    if (isDesktop) {
        return (
            <Popover open={isOpen} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full rounded text-white`}
                    >
                        {type === 'debit' ? 'You Gave ₹' : 'You Got ₹'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align={type === 'debit' ? 'start' : 'center'}
                    className='w-78 p-0'
                    sideOffset={12}
                >
                    <h1
                        className={`line-clamp-1 truncate overflow-hidden border-b p-2 text-center font-mono text-lg font-semibold ${
                            type === 'debit'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                        }`}
                    >
                        {type === 'debit'
                            ? `You gave ${formatINR(transaction.amount)} to ${selectedCustomer?.name}`
                            : `You got ${formatINR(transaction.amount)} from ${selectedCustomer?.name}`}
                    </h1>

                    <div className='my-2 space-y-3 p-2'>
                        <Input
                            className='w-full rounded-[1px]'
                            placeholder='Enter Amount'
                            startContent='₹'
                            type='number'
                            // value={transaction.amount.toString()}
                            onChange={(e) => setTransactionAmount(type, Number(e.target.value))}
                        />
                        <PaymentMode
                            selectedKey={transaction.mode}
                            onSelectionChange={(mode) =>
                                setTransactionMode(type, mode as PaymentMethodType)
                            }
                        />
                        <Input
                            className='w-full rounded-[1px]'
                            placeholder='Enter Note (optional)'
                            value={transaction.note}
                            onChange={(e) => setTransactionNote(type, e.target.value)}
                        />
                    </div>
                    <div className='border-t p-2'>
                        <Button
                            className={`w-full rounded-md text-white ${
                                type === 'debit' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            isLoading={addTransaction.isPending}
                            onPress={handlePlaceTransaction}
                        >
                            {addTransaction.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <DrawerNested open={isOpen} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button
                    className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full rounded text-white`}
                >
                    {type === 'debit' ? 'You Gave ₹' : 'You Got ₹'}
                </Button>
            </DrawerTrigger>
            <DrawerContent className='h-[80vh]'>
                <DrawerHeader className='border-b p-2'>
                    <DrawerTitle
                        className={`line-clamp-1 truncate overflow-hidden text-center font-mono text-lg font-semibold ${
                            type === 'debit'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                        }`}
                    >
                        {type === 'debit'
                            ? `You gave ${formatINR(transaction.amount)} to ${selectedCustomer?.name}`
                            : `You got ${formatINR(transaction.amount)} from ${selectedCustomer?.name}`}
                    </DrawerTitle>
                    <DrawerDescription aria-hidden />
                </DrawerHeader>
                <DrawerBody className='mt-2 space-y-3 p-2'>
                    <Input
                        className='w-full rounded-[1px]'
                        placeholder='Enter Amount'
                        startContent='₹'
                        type='number'
                        // value={transaction.amount.toString()}
                        onChange={(e) => setTransactionAmount(type, Number(e.target.value))}
                    />
                    <PaymentMode />
                    <Input
                        className='w-full rounded-[1px]'
                        placeholder='Enter Note (optional)'
                        value={transaction.note}
                        onChange={(e) => setTransactionNote(type, e.target.value)}
                    />
                </DrawerBody>
                <DrawerFooter className='border-t p-2'>
                    <Button
                        className={`w-full rounded-md text-white ${
                            type === 'debit' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                    >
                        Save
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </DrawerNested>
    )
}

function formatINR(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
const modes: PaymentMethodType[] = ['cash', 'upi', 'card']

function PaymentMode({ ...tabsProps }: TabsProps) {
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
                {...tabsProps}
            >
                {modes.map((m) => (
                    <Tab key={m} title={m.toUpperCase()} value={m} />
                ))}
            </Tabs>
        </div>
    )
}

export type PaymentMethodType = 'cash' | 'upi' | 'card'
