'use client'

import { formatPrice } from '@/lib/utils'

export function Balance({ balance }: { balance: { get: number; give: number } }) {
    return (
        <div className='flex items-center justify-between rounded-2xl border p-4 select-none'>
            <div className='flex w-full flex-col items-center'>
                <p className='text-muted-foreground text-xs md:text-sm'>You will give </p>
                <h3 className='text-sm font-bold text-green-500 md:text-xl'>
                    {formatPrice(balance.give)}
                </h3>
            </div>
            <div className='h-6 border border-dashed' />
            <div className='flex w-full flex-col items-center'>
                <p className='text-muted-foreground text-xs md:text-sm'>You will get </p>
                <h3 className='text-sm font-bold text-red-500 md:text-xl'>
                    {formatPrice(balance.get)}
                </h3>
            </div>
        </div>
    )
}
