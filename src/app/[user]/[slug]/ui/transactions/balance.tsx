
'use client'

import { formatPrice } from '@/lib/utils'

export function Balance({ balance }: { balance: { get: number, give: number } }) {

    return (
        <div className="border p-4 flex items-center justify-between rounded-2xl select-none">
                <div className="flex flex-col items-center w-full">
                <p className='text-muted-foreground text-xs md:text-sm'>You will give </p>
                <h3 className='text-green-500 font-bold text-sm md:text-xl'>{formatPrice(balance.give)}</h3>
                </div>
                <div className="border border-dashed h-6" />
                <div className="flex flex-col items-center w-full">
                <p className='text-muted-foreground text-xs md:text-sm'>You will get </p>
                <h3 className='text-red-500 font-bold text-sm md:text-xl'>{formatPrice(balance.get)}</h3>
                </div>
        </div>
    )
}