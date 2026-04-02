'use client'

import {
    Button,
    Input,
    InputGroup,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tabs,
    useOverlayState,
} from '@heroui/react'
import type { Key, KeyboardEvent as ReactKeyboardEvent } from 'react'

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
import type { PaymentMethodType } from '@/zustand/store/cart'

function stopSearchBarKeyHandling(event: ReactKeyboardEvent<HTMLElement>) {
    event.stopPropagation()
}

const currencySymbol = '\u20B9'

export function AddTransaction({ type }: { type: 'debit' | 'credit' }) {
    const overlayState = useOverlayState()
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
            overlayState.close()
        } catch (error) {
            logWarning('Failed to add transaction', error)
        }
    }

    const title =
        type === 'debit'
            ? `You gave ${formatINR(transaction.amount)} to ${selectedTransaction?.name}`
            : `You got ${formatINR(transaction.amount)} from ${selectedTransaction?.name}`

    const amountInput = (
        <InputGroup className='w-full rounded-[1px]'>
            <InputGroup.Prefix>{currencySymbol}</InputGroup.Prefix>
            <InputGroup.Input
                placeholder='Enter Amount'
                type='number'
                value={amountValue}
                onChange={(e) => setTransactionAmount(type, Number(e.target.value))}
            />
        </InputGroup>
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
            isDisabled={addTransaction.isPending}
            onPress={handlePlaceTransaction}
        >
            {addTransaction.isPending ? 'Saving...' : 'Save'}
        </Button>
    )

    if (isDesktop) {
        return (
            <Popover isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
                <PopoverTrigger>
                    <Button
                        className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full text-white`}
                    >
                        {type === 'debit' ? `You Gave ${currencySymbol}` : `You Got ${currencySymbol}`}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='bg-background max-w-78 overflow-hidden border p-0'>
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
        <DrawerNested open={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
            <DrawerTrigger asChild>
                <Button
                    size='sm'
                    className={`${type === 'debit' ? 'bg-red-500' : 'bg-green-500'} w-full text-white`}
                >
                    {type === 'debit' ? `You Gave ${currencySymbol}` : `You Got ${currencySymbol}`}
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
    return `${currencySymbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const modes: PaymentMethodType[] = ['cash', 'upi', 'card', 'paylater']

type PaymentModeProps = {
    selectedKey: PaymentMethodType
    onSelectionChange: (key: Key) => void
}

function PaymentMode({ selectedKey, onSelectionChange }: PaymentModeProps) {
    return (
        <div onKeyDown={stopSearchBarKeyHandling}>
            <h3 className='text-muted-foreground mb-1 text-sm font-medium'>Payment Method</h3>
            <Tabs
                className='[&_button]:bg-default/15'
                selectedKey={selectedKey}
                variant='secondary'
                onSelectionChange={onSelectionChange}
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label='Payment Mode'>
                        {modes.map((mode) => (
                            <Tabs.Tab key={mode} id={mode}>
                                {mode.toUpperCase()}
                                <Tabs.Indicator className='rounded-full' />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>
        </div>
    )
}
