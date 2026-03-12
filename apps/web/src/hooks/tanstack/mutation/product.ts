'use client'
import { addProduct, updateProduct } from '@/actions/user'
import { Product } from '@/types/product'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query/queryKeys'

export function useAddProduct() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Product) => {
            return await addProduct(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.sellerProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProductCategories.all })
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
            qc.invalidateQueries({ queryKey: queryKeys.sellerProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProductCategories.all })
        },
    })
}
