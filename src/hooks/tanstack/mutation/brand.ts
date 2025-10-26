'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Category, CategoryInput } from '@/types/category'
import { createBrand, updateBrand } from '@/actions/user/brand'

export function useCreateBrand() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: CategoryInput) => {
            return await createBrand(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['Brands'] })
        },
    })
}

export function useUpdateBrand() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (data: Category & { imageUrl?: string }) => {
            return await updateBrand(data)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['Brands'] })
        },
    })
}
