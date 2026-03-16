'use client'

import { notFound } from 'next/navigation'
import { AddProduct } from '../../ui/products/add'

export default function CreateModal({ params }: { params: { slug: string } }) {
    if (params.slug !== 'pos') {
        notFound()
    }

    return <AddProduct mode='add' isOpen />
}
