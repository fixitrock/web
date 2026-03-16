'use client'

import { memo } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { Button } from '@heroui/react'

import { CommandItem, CommandShortcut } from '@/ui/command'
import { TransactionSkeleton } from '@/ui/skeleton'

import { Balance } from './balance'
import { fallback } from '@/config/site'
import { balanceColor, formatDateTime, formatPrice, normalizeName } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { useMyTransaction } from '@/hooks/tanstack/query'
import { useSearchStore } from '@/zustand/store'
import { useDebounce } from '@/hooks/useDebounce'
import { TransactionItem } from '@/types/transaction'
import { TransactionHistory } from './history'

const TransactionRow = memo(
    ({
        transaction,
        view,
        onOpen,
    }: {
        transaction: TransactionItem
        view: 'seller' | 'user'
        onOpen: (transaction: TransactionItem) => void
    }) => {
        const { name, avatar, updated_at, balance, phone } = transaction

        const avatarSrc =
            bucketUrl(avatar) || `${fallback.user}${normalizeName(name)}.svg?text=${name.charAt(0)}`

        return (
            <CommandItem
                key={transaction.id}
                value={transaction.id}
                onSelect={() => onOpen(transaction)}
            >
                <Image
                    width={35}
                    height={35}
                    src={avatarSrc}
                    alt={name}
                    className='aspect-square rounded-full object-cover'
                />
                <div className='flex flex-1 flex-col'>
                    <p className='text-medium truncate font-semibold'>{name}</p>
                    <p className='text-muted-foreground truncate text-[10px]'>
                        {formatDateTime(updated_at)}
                    </p>
                </div>

                <CommandShortcut
                    className={`text-lg font-bold tracking-normal ${balanceColor(balance, view)}`}
                >
                    {formatPrice(balance)}
                </CommandShortcut>
            </CommandItem>
        )
    }
)

TransactionRow.displayName = 'TransactionRow'

export function Transactions({ balance }: { balance: { get: number; give: number } }) {
    const { query, selectedTransaction, setSelectedTransaction } = useSearchStore()

    const debouncedQuery = useDebounce(query)

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
        useMyTransaction(debouncedQuery)

    const transactions = data?.transactions ?? []
    const view = data?.view ?? 'user'

    if (selectedTransaction) {
        return <TransactionHistory user={selectedTransaction} view={view} />
    }

    if (isError) {
        return (
            <div className='flex flex-col gap-2 p-1.5'>
                <Balance balance={balance} />
                <p className='text-danger py-10 text-center text-sm'>
                    Failed to load transactions. Please try again.
                </p>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-2 p-1.5'>
            <Balance balance={balance} />
            {isLoading ? (
                <TransactionSkeleton length={8} />
            ) : (
                <>
                    {transactions.map((t: TransactionItem) => (
                        <TransactionRow
                            key={t.id}
                            transaction={t}
                            view={view}
                            onOpen={(transaction) => setSelectedTransaction(transaction)}
                        />
                    ))}
                    {hasNextPage && (
                        <div className='flex items-center justify-center'>
                            <Button
                                isLoading={isFetchingNextPage}
                                radius='full'
                                size='sm'
                                startContent={!isFetchingNextPage && <ChevronDown size={14} />}
                                variant='flat'
                                onPress={() => fetchNextPage()}
                            >
                                {isFetchingNextPage ? 'Loading . . .' : 'Show More'}
                            </Button>
                        </div>
                    )}

                    {transactions.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-10 opacity-60'>
                            <p className='text-muted-foreground text-center text-sm'>
                                {query
                                    ? `No transactions found for "${query}"`
                                    : 'No transactions recorded yet.'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
