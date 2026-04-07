'use client'

import { notFound, useParams } from 'next/navigation'
import { AddProduct } from '../../ui/products/add'

export default function CreateModal() {
    const params = useParams<{ slug: string }>()

    if (params.slug !== 'pos') {
        notFound()
    }

    return <AddProduct mode='add' isOpen />
}
