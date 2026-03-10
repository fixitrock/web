'use client'

import Image from 'next/image'
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'

import { balanceColor, formatPhone, normalizeName } from '@/lib/utils'
import { TransactionItem } from '@/types/transaction'
import { bucketUrl } from '@/supabase/bucket'
import { fallback } from '@/config/site'
import { NoTransactionMessage, TransactionCard, TransactionSkeleton } from './card'
import { useMyTransactions } from '@/hooks/tanstack/query'
import NumberFlow from '@number-flow/react'
import { Button } from '@heroui/react'
import { useSearchStore } from '@/zustand/store'

export function TransactionHistory({
    user,
    view,
}: {
    user: TransactionItem
    view: 'seller' | 'user'
}) {
    const { data, isLoading, isError, isFetchingNextPage, fetchNextPage } =
        useMyTransactions(user.id)
    const { transactionSeller, setTransactionSeller } = useSearchStore()

    const transactions = data?.transactions ?? []
    const hasMore = data?.hasMore ?? false
    const totalReceived = data?.summary?.totalReceived ?? 0
    const totalPaid = data?.summary?.totalPaid ?? 0
    const balance = data?.summary?.balance ?? 0
    const isSeller = Boolean(data?.seller)
    const avatarSrc =
        bucketUrl(user.avatar) ||
        `${fallback.user}${normalizeName(user.name)}.svg?text=${user.name.charAt(0)}`

    if (transactionSeller !== isSeller) {
        setTransactionSeller(isSeller)
    }

    return (
        <div className='space-y-3 p-1.5'>
            <div className='relative overflow-hidden rounded-3xl border p-3'>
                <div className='relative mb-3 flex items-center gap-3 rounded-2xl border p-3 shadow-xs backdrop-blur'>
                    <Image
                        src={avatarSrc}
                        alt={user.name}
                        width={48}
                        height={48}
                        className='border-default-200 rounded-full border-2 object-cover shadow-sm'
                    />
                    <div className='min-w-0 flex-1'>
                        <p className='truncate text-base font-semibold tracking-tight'>
                            {user.name}
                        </p>
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                            {formatPhone(user.phone)}
                        </p>
                    </div>
                    <div className='rounded-xl'>
                        <h3
                            className={`${balanceColor(balance, view)} text-lg font-bold tracking-normal`}
                        >
                            <NumberFlow
                                className='overflow-hidden'
                                format={{
                                    style: 'currency',
                                    currency: 'INR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }}
                                value={Math.abs(balance)}
                            />
                        </h3>
                    </div>
                </div>

                <div className='relative overflow-hidden rounded-2xl'>
                    <div className='grid grid-cols-2 gap-2.5'>
                        <div className='flex w-full flex-col items-start rounded-xl bg-emerald-50/70 p-2 md:p-4 dark:bg-emerald-500/15'>
                            <div className='mb-2 flex w-full items-center justify-between'>
                                <p className='text-[10px] font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-200'>
                                    Received
                                </p>
                                <TrendingUp className='size-3.5 text-emerald-700 dark:text-emerald-300' />
                            </div>
                            <h3 className='text-md w-full text-left font-bold text-emerald-600 md:text-2xl dark:text-emerald-300'>
                                <NumberFlow
                                    className='overflow-hidden'
                                    format={{ style: 'currency', currency: 'INR' }}
                                    value={totalReceived}
                                />
                            </h3>
                        </div>
                        {/* <div className='flex w-full flex-col items-start rounded-xl bg-sky-50/70 p-2 md:p-4 dark:bg-sky-500/15'>
                            <div className='mb-2 flex w-full items-center justify-between'>
                                <p className='text-[10px] font-semibold tracking-[0.12em] text-sky-800 uppercase dark:text-sky-200'>
                                    Balance
                                </p>
                                <Scale className='size-3.5 text-sky-700 dark:text-sky-300' />
                            </div>
                            <h3 className='text-md w-full text-left font-bold text-sky-600 md:text-2xl dark:text-sky-300'>
                                <NumberFlow
                                    className='overflow-hidden'
                                    format={{ style: 'currency', currency: 'INR' }}
                                    value={balance}
                                />
                            </h3>
                        </div> */}
                        <div className='flex w-full flex-col items-start rounded-xl bg-rose-50/70 p-2 md:p-4 dark:bg-rose-500/15'>
                            <div className='mb-2 flex w-full items-center justify-between'>
                                <p className='text-[10px] font-semibold tracking-[0.12em] text-rose-800 uppercase dark:text-rose-200'>
                                    Paid
                                </p>
                                <TrendingDown className='size-3.5 text-rose-700 dark:text-rose-300' />
                            </div>
                            <h3 className='text-md w-full text-left font-bold text-rose-600 md:text-2xl dark:text-rose-300'>
                                <NumberFlow
                                    className='overflow-hidden'
                                    format={{ style: 'currency', currency: 'INR' }}
                                    value={totalPaid}
                                />
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <TransactionCard transactions={transactions} view={view} />
            {isLoading && <TransactionSkeleton />}
            {isError && <NoTransactionMessage />}
            {hasMore && (
                <div className='flex items-center justify-center mb-0.5'>
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
        </div>
    )
}
