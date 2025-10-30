'use client'

import { useSellerProducts } from '@/hooks/tanstack/query'

export function ProductsCard() {
    const { data, isLoading } = useSellerProducts('', '')
    return <div></div>
}
