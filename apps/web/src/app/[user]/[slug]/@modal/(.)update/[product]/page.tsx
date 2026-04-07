'use client'

import { useParams, notFound } from 'next/navigation'
import { useProductSlug } from '@/hooks/tanstack/query'
import { useProductStore } from '@/zustand/store/product'
import { AddProduct } from '../../../ui/products/add'

export default function UpdateModal() {
    const params = useParams<{ slug: string; product: string }>()

    if (params.slug !== 'pos') {
        notFound()
    }

    const scheduleSyncEditingProduct = useProductStore((state) => state.scheduleSyncEditingProduct)

    const { data } = useProductSlug(params.product)

    if (data?.product) {
        scheduleSyncEditingProduct(data.product)
    }

    return <AddProduct mode='update' isOpen />
}
