'use client'

import type { Product, ProductVariant } from '@/types/product'

import { useMemo, useState } from 'react'
import { Image } from '@heroui/react'

import { Input } from '@/ui/input'
import { Separator } from '@/ui/separator'
import { ScrollArea } from '@/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/ui/badge'

import { CategoryCombobox } from './tabs'

type Props = {
    products: Product[]
    onAdd: (product: Product, variant?: ProductVariant) => void
}

export function ProductList({ products, onAdd }: Props) {
    const [query, setQuery] = useState('')
    const categories = useMemo(
        () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
        [products]
    )
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()

        return products.filter((p) => {
            const matchesQuery =
                !q ||
                p.name.toLowerCase().includes(q) ||
                (p.brand?.toLowerCase().includes(q) ?? false) ||
                (p.category?.toLowerCase().includes(q) ?? false) ||
                (p.storage?.toLowerCase().includes(q) ?? false) ||
                (p.color?.name.toLowerCase().includes(q) ?? false)
            const matchesCategory = !selectedCategory || p.category === selectedCategory

            return matchesQuery && matchesCategory
        })
    }, [products, query, selectedCategory])

    return (
        <section className='flex h-full flex-col'>
            <div className='p-4'>
                <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
                    <div className='flex-1'>
                        <Input
                            aria-label='Search products'
                            className='bg-card pl-9'
                            placeholder='Search products...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className='sm:w-56'>
                        <CategoryCombobox
                            categories={categories}
                            placeholder='Filter by category'
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                        />
                    </div>
                </div>
            </div>
            <Separator />
            <ScrollArea className='flex-1 overflow-y-scroll'>
                <VariantAList products={filtered} onAdd={onAdd} />
            </ScrollArea>
        </section>
    )
}

function VariantAList({
    products,
    onAdd,
}: {
    products: Product[]
    onAdd: (p: Product, v?: ProductVariant) => void
}) {
    return (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {products.flatMap((p) => {
                const variants = p.variants_cache

                if (!variants || variants.length === 0) {
                    return (
                        <Card key={`p-${p.id}`} className='h-full'>
                            <CardHeader>
                                <CardTitle className='text-pretty'>{p.name}</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='bg-secondary relative aspect-square overflow-hidden rounded-md'>
                                    <Image
                                        alt={p.name}
                                        className='object-cover'
                                        src={
                                            p.img[0] ??
                                            '/placeholder.svg?height=320&width=320&query=product'
                                        }
                                    />
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='font-medium'>{formatPrice(p.price)}</span>
                                    <Button size='sm' onClick={() => onAdd(p)}>
                                        Add
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                }

                return variants.map((v) => (
                    <Card key={`pv-${p.id}-${v.id}`} className='h-full'>
                        <CardHeader>
                            <CardTitle className='text-pretty'>{p.name}</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='bg-secondary relative aspect-square overflow-hidden rounded-md'>
                                <Image
                                    alt={`${p.name} ${v.color?.name ?? ''} ${v.storage ?? ''}`}
                                    className='object-cover'
                                    src={
                                        v.img[0] ??
                                        p.img[0] ??
                                        '/placeholder.svg?height=320&width=320&query=variant'
                                    }
                                />
                            </div>
                            <div className='flex flex-wrap items-center gap-2'>
                                {v.color?.name ? (
                                    <Badge variant='secondary'>{v.color.name}</Badge>
                                ) : null}
                                {v.storage ? <Badge variant='secondary'>{v.storage}</Badge> : null}
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='font-medium'>
                                    {formatPrice(Number.isFinite(v.price) ? v.price : p.price)}
                                </span>
                                <Button size='sm' onClick={() => onAdd(p, v)}>
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            })}
        </div>
    )
}
