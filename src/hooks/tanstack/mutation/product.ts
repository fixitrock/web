'use client'
import { addProduct, updateProduct } from '@/actions/user'
import { Product } from '@/types/product'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddProduct() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Product) => {
            return await addProduct(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['Products'] })
            qc.invalidateQueries({ queryKey: ['SellerProducts'] })
        },
    })
}

export function useUpdateProduct() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Product) => {
            return await updateProduct(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['Products'] })
            qc.invalidateQueries({ queryKey: ['SellerProducts'] })
        },
    })
}