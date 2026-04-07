'use client'

import { AddProduct } from '../ui/products/add'
import { notFound, useParams } from 'next/navigation'

export default function CreatePage() {
    const params = useParams<{ slug: string }>()

    if (params.slug !== 'pos') {
        notFound()
    }
    return <AddProduct mode='add' isOpen />
}
