'use client'

import { useUserProducts } from '@/hooks/tanstack/query'
import { ProductGrid } from '../../[slug]/ui/products/card'
import { ProductGridSkeleton } from '../../[slug]/ui/products/skeleton'
import { Button } from '@heroui/react'
import { PosEmptyState } from '@/ui/empty'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ProductsTabs({ username }: { username: string }) {
    const { data, isLoading } = useUserProducts(username, '', '', 1, 18)
    const hasProducts = !data?.empty && data?.products && data.products.length > 0

    return (
        <>
            {data?.empty ? (
                <PosEmptyState type='product' />
            ) : (
                <main className='flex flex-col gap-6'>
                    {isLoading && <ProductGridSkeleton />}
                    <div className='flex items-center justify-between'>
                        <h1 className='text-xl font-bold'>Latest Products</h1>
                        <Button
                            as={Link}
                            href={`/@${username}/products`}
                            className='border bg-transparent'
                            size='sm'
                            endContent={
                                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                            }
                        >
                            <span className='text-sm font-medium'>View All</span>
                        </Button>
                    </div>
                    {hasProducts && <ProductGrid products={data.products} />}
                </main>
            )}
        </>
    )
}
