'use client'

import { PackageOpen } from 'lucide-react'

export function ProductEmpty() {
    return (
        <div className='bg-background/50 fixed inset-0 z-10 flex flex-col items-center justify-center p-4 text-center'>
            <div className='bg-muted/40 rounded-2xl p-6 shadow-inner'>
                <PackageOpen className='text-muted-foreground size-14' strokeWidth={1.5} />
            </div>

            <h2 className='text-foreground mt-6 text-xl font-semibold'>No Products Yet</h2>

            <p className='text-muted-foreground mt-2 max-w-md text-sm'>
                There are currently no products available. Once new items are added, they’ll appear
                here automatically.
            </p>
        </div>
    )
}
