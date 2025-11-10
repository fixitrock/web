'use server'

import { withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { Product, Products } from '@/types/product'
import { R2 } from '@/supabase/r2'

export const deleteImagesFromR2 = async (paths: string[]): Promise<void> => {
    if (!Array.isArray(paths) || paths.length === 0) return

    const cleanedPaths = paths.map((p) => p.replace(/^\/?/, '').trim()).filter(Boolean)

    if (cleanedPaths.length === 0) return

    await Promise.all(
        cleanedPaths.map((path) =>
            R2.send(
                new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME!,
                    Key: path,
                })
            )
        )
    )
}

export const addProduct = withErrorHandling(async (data: Product) => {
    const supabase = await createClient()
    const { data: product_id, error } = await supabase.rpc('addproduct', { payload: data })
    if (error) throw error
    return product_id
})

export const updateProduct = withErrorHandling(async (data: Product) => {
    const supabase = await createClient()

    const { data: oldProducts, error: fetchError } = await supabase.rpc('posproduct', {
        search: data.name,
        category: data.category,
    })
    if (fetchError) throw fetchError

    const oldProduct = oldProducts?.products?.find((p: any) => p.id === data.id)
    const oldVariants = oldProduct?.variants ?? []

    const oldImages = new Set<string>()
    const newImages = new Set<string>()

    oldVariants.forEach((v: any) => {
        v.image?.forEach((img: unknown) => {
            if (typeof img === 'string') oldImages.add(img)
        })
    })

    data.variants?.forEach((v) => {
        v.image?.forEach((img) => {
            if (typeof img === 'string') newImages.add(img)
        })
    })

    const removed = [...oldImages].filter((img) => !newImages.has(img))

    const { data: product_id, error: updateError } = await supabase.rpc('updateproduct', {
        payload: data,
    })
    if (updateError) throw updateError

    if (removed.length > 0) await deleteImagesFromR2(removed)

    return product_id
})

export const sellerProducts = async (search: string, category?: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('posproduct', { search, category })

    return {
        products: (data?.products ?? []) as Products,
        error,
        empty: data?.empty ?? true,
    }
}

export const userProducts = async (
    username: string,
    search: string,
    category?: string,
    page?: number,
    limit?: number
) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('userproducts', {
        username,
        search,
        category,
        page,
        limit_count: limit,
    })

    return {
        products: (data?.products ?? []) as Products,
        total: data?.total,
        error,
        empty: data?.empty ?? true,
    }
}
