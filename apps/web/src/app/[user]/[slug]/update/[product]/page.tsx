'use client'

import { notFound, useParams } from 'next/navigation'
import { useProductSlug } from '@/hooks/tanstack/query'
import { useProductStore } from '@/zustand/store/product'
import { AddProduct } from '../../ui/products/add'

export default function UpdatePage() {
    const params = useParams<{ slug: string; product: string }>()

    if (params.slug !== 'pos') {
        notFound()
    }

    const { editingProduct, setMode } = useProductStore()
    const slug = editingProduct ? '' : params.product

    const { data } = useProductSlug(slug)

    if (!editingProduct && data?.product) {
        setMode('update', data.product)
    }

    return <AddProduct mode='update' isOpen />
}
