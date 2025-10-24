'use client'

import { PackageOpen } from 'lucide-react'

interface PosEmptyStateProps {
    type: 'product' | 'search' | 'category'
    value?: string | null
    cta?: React.ReactNode
}

const pos = {
    product: {
        title: 'No Products Yet',
        description: `There are currently no products available. Once new items are added, they'll appear here automatically.`,
    },
    search: (query?: string) => ({
        title: 'No Products Found',
        description: `We couldn't find any products matching your search: "${query}". Please try again.`,
    }),
    category: (category?: string) => ({
        title: 'No Products in Category',
        description: `There are currently no products in the "${category}" category. Please select another category or add new products.`,
    }),
}

export function PosEmptyState({ type, value, cta }: PosEmptyStateProps) {
    const state =
        type === 'product'
            ? pos.product
            : type === 'search'
              ? pos.search(value as string)
              : pos.category(value as string)

    return (
        <div className='bg-background/50 flex h-full w-full items-center justify-center p-4'>
            <div className='flex flex-col items-center justify-center gap-4 text-center'>
                <div className='bg-muted/40 rounded-2xl p-6 shadow-inner'>
                    <PackageOpen className='text-muted-foreground size-14' strokeWidth={1.5} />
                </div>

                <h2 className='text-foreground mt-2 text-xl font-semibold'>{state.title}</h2>
                <p className='text-muted-foreground mt-1 max-w-md text-sm'>{state.description}</p>
                {cta && <div className='mt-4'>{cta}</div>}
            </div>
        </div>
    )
}
