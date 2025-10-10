import { Navbar } from '@heroui/react'
import { Suspense } from 'react'

import { Input } from '@/app/(space)/ui'
import { userCategories, userProducts } from '@/actions/user/beta/product'
import { ProductEmpty } from '@/components/empty'

import { CategorySkeleton, CategoryTabs } from './beta/tabs'
import { ProductGrid, ProductGridSkeleton } from './beta/card'

interface ProductsProps {
    params: { user: string }
    searchParams?: Promise<{ category?: string; s?: string }>
}

export default async function Products({ params, searchParams }: ProductsProps) {
    const query = await searchParams
    const category = query?.category

    return (
        <div className='space-y-1.5 p-2 2xl:px-[10%]'>
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper:
                        'mt-1.5 h-auto flex-col-reverse items-start gap-1 p-0 sm:flex-row sm:items-center sm:gap-2',
                }}
                maxWidth='full'
            >
                <Suspense fallback={<CategorySkeleton />}>
                    <CategorySection category={category} username={params.user} />
                </Suspense>

                <div className='flex w-full items-center gap-2 sm:w-[50%] md:w-[40%] xl:w-[25%]'>
                    <Input
                        classNames={{
                            inputWrapper:
                                'rounded-2xl border bg-transparent shadow-none group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent',

                            input: 'truncate overflow-hidden',
                        }}
                        hotKey='P'
                        placeholder='Search Products . . .'
                        value={query?.s || ''}
                    />
                </div>
            </Navbar>

            <Suspense key={category} fallback={<ProductGridSkeleton />}>
                <ProductSection category={category} username={params.user} />
            </Suspense>
        </div>
    )
}

async function CategorySection({ username, category }: { username: string; category?: string }) {
    const { categories, empty } = await userCategories(username)

    if (empty) return <div className='w-full' />

    return <CategoryTabs categories={categories} selected={category || 'all'} username={username} />
}

async function ProductSection({ username, category }: { username: string; category?: string }) {
    const { products, empty } = await userProducts(username, category)

    if (empty) return <ProductEmpty />

    return <ProductGrid products={products} />
}
