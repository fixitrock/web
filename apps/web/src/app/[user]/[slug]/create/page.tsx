'use client'

import { AddProduct } from '../ui/products/add'
import { notFound } from 'next/navigation'

export default function CreatePage({ params }: { params: { slug: string } }) {
    if (params.slug !== 'pos') {
        notFound()
    }

    return <AddProduct mode='add' isOpen />
}
