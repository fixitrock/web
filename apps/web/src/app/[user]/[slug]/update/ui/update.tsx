'use client'

import { AddProduct } from '../../ui/products/add'

interface AddModalProps {
    mode: 'add' | 'update'
}

export function UpdateProduct({ mode }: AddModalProps) {
    return <AddProduct mode={mode} isOpen />
}
