'use client'

import { formatPrice } from '@/lib/utils'

export function Balance({ balance }: { balance: { get: number; give: number } }) {
    return (
        <div className='flex items-center gap-2'>
            <div className='flex w-full flex-col items-center p-2 md:p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/20'>
                <p className='text-muted-foreground text-xs md:text-sm'>You will give </p>
                <h3 className='text-md font-bold text-green-500 md:text-2xl'>
                    {formatPrice(balance.give)}
                </h3>
            </div>
            <div className='flex w-full flex-col items-center p-2 md:p-4 rounded-xl bg-red-50/50 dark:bg-red-500/20'>
                <p className='text-muted-foreground text-xs md:text-sm'>You will get </p>
                <h3 className='text-md font-bold text-red-500 md:text-2xl'>
                    {formatPrice(balance.get)}
                </h3>
            </div>
        </div>
    )
}
