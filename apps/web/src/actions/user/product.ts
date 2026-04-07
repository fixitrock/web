'use server'

import { createSafeAction, logWarning, withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { Categories, Product, Products } from '@/types/product'
import { R2 } from '@/supabase/r2'
import { appMessages, getProductErrorMessage } from '@/config/messages'

const errorText = (error: {
    message?: string
    details?: string
    hint?: string
    code?: string
}): string => [error.message, error.details, error.hint, error.code].filter(Boolean).join(' | ')

function normalizeVariants(variants: Product['variants']): Product['variants'] {
    return (variants ?? []).map((variant) => ({
        ...variant,
        brand: typeof variant.brand === 'string' ? variant.brand : '',
        storage: typeof variant.storage === 'string' ? variant.storage : '',
        image: Array.isArray(variant.image) ? variant.image : [],
        color: variant.color ?? null,
        purchase_price: variant.purchase_price,
        wholesale_price: variant.wholesale_price,
        price: variant.price,
        mrp: variant.mrp,
        quantity: variant.quantity,
    }))
}

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

const addProductAction = withErrorHandling(async (data: Product) => {
    const payload: Product = {
        ...data,
        variants: normalizeVariants(data.variants),
    }

    const supabase = await createClient()
    const { data: product_id, error } = await supabase.rpc('addproduct', { payload })
    if (error) {
        logWarning('addProduct rpc error:', error)
        throw new Error(getProductErrorMessage(errorText(error), 'add'))
    }
    return product_id
})

const updateProductAction = withErrorHandling(async (data: Product) => {
    if (!data.updated_at) {
        throw new Error(appMessages.product.missingVersion)
    }

    const payload: Product = {
        ...data,
        variants: normalizeVariants(data.variants),
    }

    const supabase = await createClient()

    const { data: oldProducts, error: fetchError } = await supabase.rpc('posproduct', {
        search: payload.name,
        category: payload.category,
    })
    if (fetchError) {
        logWarning('updateProduct posproduct rpc error:', fetchError)
        throw new Error(getProductErrorMessage(errorText(fetchError), 'update'))
    }

    const oldProduct = oldProducts?.products?.find((p: any) => p.id === payload.id)
    const oldVariants = oldProduct?.variants ?? []

    const oldImages = new Set<string>()
    const newImages = new Set<string>()

    if (oldProduct?.thumbnail) oldImages.add(oldProduct.thumbnail)
    if (payload.thumbnail && typeof payload.thumbnail === 'string') newImages.add(payload.thumbnail)

    oldVariants.forEach((v: any) => {
        v.image?.forEach((img: unknown) => {
            if (typeof img === 'string') oldImages.add(img)
        })
    })

    payload.variants?.forEach((v) => {
        v.image?.forEach((img) => {
            if (typeof img === 'string') newImages.add(img)
        })
    })

    const removed = [...oldImages].filter((img) => !newImages.has(img))

    const { data: product_id, error: updateError } = await supabase.rpc('updateproduct', {
        payload,
    })
    if (updateError) {
        logWarning('updateProduct rpc error:', updateError)
        throw new Error(getProductErrorMessage(errorText(updateError), 'update'))
    }

    if (removed.length > 0) await deleteImagesFromR2(removed)

    return product_id
})

export const addProduct = createSafeAction(addProductAction)
export const updateProduct = createSafeAction(updateProductAction)

export const sellerProducts = async (search: string, category?: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('posproduct', { search, category })

    return {
        products: (data?.products ?? []) as Products,
        error,
        empty: data?.empty ?? true,
    }
}

export const productSlug = async (slug: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('product_slug', {
        p_slug: slug,
    })

    return {
        product: data as Product | null,
        error,
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

    const currentPage = data?.page ?? page ?? 1
    const totalPages = data?.total_pages ?? 1

    return {
        products: (data?.products ?? []) as Products,
        total: data?.total,
        error,
        empty: data?.empty ?? true,
        page: currentPage,
        limit: data?.limit ?? limit ?? 42,
        total_pages: totalPages,
        hasMore: currentPage < totalPages,
    }
}

export const userCategories = async (username: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('usercategories', { username })

    return {
        categories: (data.categories ?? []) as Categories,
        top: (data.top ?? []) as Categories,
        error,
    }
}
