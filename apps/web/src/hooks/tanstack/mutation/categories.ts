'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CategoryInput } from '@/types/category'
import { createCategory, updateCategory } from '@/actions/user'
import { queryKeys } from '../query/queryKeys'

export function useCreateCategory() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: CategoryInput) => {
            return await createCategory(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.productCategories.all })
        },
    })
}

export function useUpdateCategory() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Category & { imageUrl?: string }) => {
            return await updateCategory(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.productCategories.all })
        },
    })
}
