// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/ui/resizable'
// import { userCategories, userProducts } from '@/actions/user/beta/product'

// import { Products } from './products'

// interface PageProps {
//     params: { user: string }
//     searchParams?: Promise<{ category?: string; s?: string }>
// }
// export async function Pos({ params, searchParams }: PageProps) {
//     const { products } = await userProducts(params.user)
//     const { categories, empty } = await userCategories(params.user)

//     return (
//         <div className='m-auto flex h-[90vh] w-full gap-1.5 p-2 2xl:px-[10%]'>
//             <ResizablePanelGroup className='bg-default/10 rounded-lg' direction='horizontal'>
//                 <ResizablePanel className='flex flex-col gap-1.5 p-1' defaultSize={70} minSize={65}>
//                     <Products categories={categories} products={products} />
//                 </ResizablePanel>
//                 <ResizableHandle withHandle className='bg-background' />
//                 <ResizablePanel className='p-1' defaultSize={30} minSize={25}>
//                     <div className='flex h-full items-center justify-center p-6'>
//                         <span className='font-semibold'>Content</span>
//                     </div>
//                 </ResizablePanel>
//             </ResizablePanelGroup>
//         </div>
//     )
// }

'use client'

import type { Product, ProductVariant } from '@/types/product'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { Cart, type CartItem } from './cart'
import { ProductList } from './products'

type Props = {
    initialProducts: Product[]
}

export function Pos({ initialProducts }: Props) {
    const [cart, setCart] = useState<CartItem[]>([])

    // derive id per line: product + optional variant
    const makeId = (p: Product, v?: ProductVariant) => `${p.id}:${v?.id ?? 0}`

    const addToCart = (product: Product, variant?: ProductVariant) => {
        setCart((prev) => {
            const id = makeId(product, variant)
            const idx = prev.findIndex((i) => i.id === id)

            if (idx >= 0) {
                const next = [...prev]

                next[idx] = { ...next[idx], qty: next[idx].qty + 1 }

                return next
            }

            return [...prev, { id, product, variant, qty: 1 }]
        })
    }

    const inc = (id: string) =>
        setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
    const dec = (id: string) =>
        setCart((prev) =>
            prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
        )
    const remove = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id))
    const clear = () => setCart([])

    const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart])

    return (
        <main className={cn('w-full')}>
            <div className='mx-auto w-full max-w-[1400px] p-4'>
                <div className='grid grid-cols-1 gap-4 lg:h-[calc(100vh-2rem)] lg:grid-cols-[2fr_1fr]'>
                    <section
                        aria-label='Products'
                        className='bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border'
                    >
                        <div className='border-b px-4 py-3'>
                            <h1 className='text-lg font-semibold text-balance'>Products</h1>
                            <p className='text-muted-foreground text-sm'>Browse and add to cart</p>
                        </div>
                        <ProductList products={SAMPLE_PRODUCTS} onAdd={addToCart} />
                    </section>

                    <section
                        aria-label='Cart'
                        className='bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border'
                    >
                        <div className='flex items-center justify-between border-b px-4 py-3'>
                            <div>
                                <h2 className='text-lg font-semibold'>Cart</h2>
                                <p className='text-muted-foreground text-sm'>
                                    {totalItems} item{totalItems !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <Cart
                            items={cart}
                            onClear={clear}
                            onDec={dec}
                            onInc={inc}
                            onRemove={remove}
                        />
                    </section>
                </div>
            </div>
        </main>
    )
}

const SAMPLE_PRODUCTS: Product[] = [
    {
        id: 1,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'iphone-13',
        name: 'iPhone 13',
        description: 'Apple smartphone with A15 Bionic.',
        compatible: null,
        category: 'Phones',
        brand: 'Apple',
        color: null,
        storage: null,
        img: ['/iphone-13-front.jpg'],
        purchase: 600,
        staff_price: 650,
        price: 699,
        mrp: 799,
        qty: 5,
        variants_cache: [
            {
                id: 101,
                color: { name: 'Midnight', code: '#101418' },
                storage: '128GB',
                brand: 'Apple',
                purchase: 600,
                staff_price: 650,
                price: 699,
                mrp: 799,
                qty: 10,
                img: ['/apple-iphone-13.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            },
            {
                id: 102,
                color: { name: 'Starlight', code: '#f3efe7' },
                storage: '128GB',
                brand: 'Apple',
                purchase: 600,
                staff_price: 650,
                price: 709,
                mrp: 799,
                qty: 8,
                img: ['/apple-iphone-13.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            },
            {
                id: 103,
                color: { name: 'Midnight', code: '#101418' },
                storage: '256GB',
                brand: 'Apple',
                purchase: 640,
                staff_price: 690,
                price: 769,
                mrp: 859,
                qty: 7,
                img: ['/apple-iphone-13.jpg'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
            },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: 2,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'samsung-s24-256',
        name: 'Samsung S24 256GB',
        description: 'Flagship Galaxy with great camera.',
        compatible: null,
        category: 'Phones',
        brand: 'Samsung',
        color: { name: 'Graphite', code: '#2b2e33' },
        storage: '256GB',
        img: ['/samsung-s24-256gb.jpg'],
        purchase: 650,
        staff_price: 700,
        price: 749,
        mrp: 899,
        qty: 5,
        variants_cache: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: 3,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'pixel-8a-128',
        name: 'Pixel 8a 128GB',
        description: 'Google’s AI-powered phone.',
        compatible: null,
        category: 'Phones',
        brand: 'Google',
        color: { name: 'Porcelain', code: '#f3efe7' },
        storage: '128GB',
        img: ['/pixel-8a-128gb.jpg'],
        purchase: 450,
        staff_price: 500,
        price: 549,
        mrp: 599,
        qty: 30,
        variants_cache: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: 4,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'ipad-10-64',
        name: 'iPad 10th Gen 64GB',
        description: 'All‑screen design. All kinds of fun.',
        compatible: null,
        category: 'Tablets',
        brand: 'Apple',
        color: { name: 'Blue', code: '#3b82f6' },
        storage: '64GB',
        img: ['/ipad-10th-gen-64gb.jpg'],
        purchase: 320,
        staff_price: 349,
        price: 379,
        mrp: 429,
        qty: 18,
        variants_cache: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: 5,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'airpods-pro-2',
        name: 'AirPods Pro (2nd Gen)',
        description: 'Active Noise Cancellation with Transparency mode.',
        compatible: null,
        category: 'Accessories',
        brand: 'Apple',
        color: { name: 'White', code: '#ffffff' },
        storage: null,
        img: ['/airpods-pro-2.jpg'],
        purchase: 190,
        staff_price: 199,
        price: 229,
        mrp: 249,
        qty: 50,
        variants_cache: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
    {
        id: 6,
        user_id: '11111111-1111-1111-1111-111111111111',
        slug: 'galaxy-buds-3',
        name: 'Galaxy Buds 3',
        description: 'Immersive sound with long battery life.',
        compatible: null,
        category: 'Accessories',
        brand: 'Samsung',
        color: { name: 'Silver', code: '#c0c0c0' },
        storage: null,
        img: ['/galaxy-buds-3.jpg'],
        purchase: 100,
        staff_price: 119,
        price: 129,
        mrp: 149,
        qty: 40,
        variants_cache: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    },
]
