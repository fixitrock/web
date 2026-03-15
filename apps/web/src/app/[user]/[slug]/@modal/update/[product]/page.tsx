'use client'

import { useParams } from 'next/navigation'
import { AddProduct } from '../../../ui/products/add'
import { useProductSlug } from '@/hooks/tanstack/query'
import { useProductStore } from '@/zustand/store/product'

export default function UpdateModal() {
  const params = useParams<{ product: string }>()
  const { editingProduct, setMode } = useProductStore()
  if (!editingProduct) {
    const {data} = useProductSlug(params.product)

    setMode('update', data?.product)
  }

  return (
    <AddProduct
      mode="update"
      isOpen
    />
  )
}