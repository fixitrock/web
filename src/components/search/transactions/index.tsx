import { History } from 'lucide-react'

export function Transactions() {
    return (
        <div className='flex h-[300px] flex-col items-center justify-center p-12 text-center'>
            <div className='bg-primary/10 mb-4 animate-pulse rounded-full p-4'>
                <History className='text-primary size-8' />
            </div>
            <h3 className='text-lg font-semibold tracking-tight'>Transaction History</h3>
            <p className='text-muted-foreground mt-2 max-w-[280px] text-sm leading-relaxed'>
                We&apos;re currently working on this feature. Soon you&apos;ll be able to track all
                your payments and credits here.
            </p>
            <div className='bg-muted/50 mt-6 rounded-lg px-3 py-1 text-[10px] font-medium tracking-wider uppercase'>
                Coming Soon
            </div>
        </div>
    )
}
