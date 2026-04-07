'use client'
import { addProduct, updateProduct } from '@/actions/user'
import { appMessages } from '@/config/messages'
import { Product } from '@/types/product'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query/queryKeys'

export function useAddProduct() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Product) => {
            const result = await addProduct(data)
            if (!result.success) {
                throw new Error(result.error ?? appMessages.common.unknownError)
            }
            return result.data
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
            const result = await updateProduct(data)
            if (!result.success) {
                throw new Error(result.error ?? appMessages.common.unknownError)
            }
            return result.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.sellerProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProducts.all })
            qc.invalidateQueries({ queryKey: queryKeys.storefrontProductCategories.all })
        },
    })
}
