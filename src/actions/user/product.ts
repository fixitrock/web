'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { logWarning, slugify } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import { Product, ProductVariant, ProductSchema, ProductVariantSchema } from '@/types/product'

// User session helper
async function userSession() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    if (!data) {
        throw new Error('Not authenticated')
    }

    try {
        const id = data.claims?.sub
        const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single()

        if (error || !user) {
            throw new Error('User not found')
        }

        return user
    } catch {
        throw new Error('Authentication failed')
    }
}

// Validate product ownership
async function validateProductOwnership(productId: number, userId: string) {
    const supabase = await createClient()
    const { data: product, error } = await supabase
        .from('product')
        .select('user_id, deleted_at')
        .eq('id', productId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw new Error('Product not found')
        }
        throw new Error(`Database error: ${error.message}`)
    }

    if (!product) {
        throw new Error('Product not found')
    }

    if (product.deleted_at) {
        throw new Error('Product has been deleted')
    }

    if (product.user_id !== userId) {
        throw new Error('Unauthorized: You can only modify your own products')
    }

    return product
}

// Generic function to extract form data excluding files
function extractFormData(formData: FormData, excludeKeys: string[] = []): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    const defaultExcludes = ['img', 'existingImg[]']
    const allExcludes = [...defaultExcludes, ...excludeKeys]

    for (const [key, value] of formData.entries()) {
        if (!allExcludes.includes(key)) {
            data[key] = value
        }
    }

    return data
}

// Generic function to handle image uploads for both products and variants
async function uploadImages(
    username: string,
    basePath: string,
    subPath: string | number,
    files: File[]
): Promise<string[]> {
    const supabase = await createClient()
    const urls: string[] = []

    // Limit to 5 images
    for (let i = 0; i < files.length && i < 5; i++) {
        const file = files[i]
        let ext = 'jpg' // default fallback

        if (file.name && file.name.includes('.')) {
            const parts = file.name.split('.')

            if (parts.length > 1) {
                ext = parts[parts.length - 1].toLowerCase()
            }
        }

        // Validate extension
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            ext = 'jpg' // fallback to jpg if invalid extension
        }

        const path = subPath
            ? `@${username}/products/${basePath}/${subPath}/${Date.now()}.${ext}`
            : `@${username}/products/${basePath}/${Date.now()}.${ext}`

        const { error } = await supabase.storage.from('user').upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        })

        if (error) throw error

        urls.push(`/user/${path}`)
    }

    return urls
}

// Generic function to delete images
async function deleteImages(imageUrls: string[]) {
    if (imageUrls.length === 0) return

    const supabase = await createClient()

    try {
        const paths = imageUrls.map((url) => url.replace(/^\/user\//, ''))
        const { error } = await supabase.storage.from('user').remove(paths)

        if (error) {
            logWarning('Failed to delete images from storage:', error)
        }
    } catch (e) {
        logWarning('Error deleting images:', e)
    }
}

// Generic function to handle image updates (deletion of removed + upload of new)
async function handleImageUpdates(
    username: string,
    basePath: string,
    subPath: string | number,
    existingImages: string[],
    currentImages: string[],
    newImages: File[]
): Promise<string[]> {
    // Find images that were removed (in currentImages but not in existingImages)
    const removedImages = currentImages.filter((url) => !existingImages.includes(url))

    // Delete removed images from storage
    if (removedImages.length > 0) {
        await deleteImages(removedImages)
    }

    // Upload new images
    let imgUrls: string[] = existingImages

    if (newImages.length > 0) {
        try {
            const newUrls = await uploadImages(username, basePath, subPath, newImages)

            imgUrls = [...existingImages, ...newUrls]
        } catch (e) {
            throw new Error('Image upload failed: ' + (e instanceof Error ? e.message : String(e)))
        }
    }

    return imgUrls
}

// Schema for product form data validation
const ProductFormSchema = ProductSchema.omit({
    id: true,
    user_id: true,
    slug: true,
    img: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    variants_cache: true,
}).extend({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
})

// Schema for variant form data validation
const VariantFormSchema = ProductVariantSchema.omit({
    id: true,
    product_id: true,
    img: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
})

// Add a new product
export async function addProduct(
    prevState: { errors: Record<string, string> },
    formData: FormData
) {
    try {
        const user = await userSession()
        const data = extractFormData(formData)

        // Validate form data with Zod
        const formDataResult = ProductFormSchema.safeParse(data)

        if (!formDataResult.success) {
            const errors: Record<string, string> = {}

            formDataResult.error.issues.forEach((issue) => {
                if (issue.path && issue.path[0]) {
                    errors[issue.path[0] as string] = issue.message
                }
            })

            return { errors }
        }

        data.user_id = user.id

        // Generate slug from product name and category
        if (data.name && data.category) {
            data.slug = slugify(`${data.name}-${data.category}`)
        } else if (data.name) {
            data.slug = slugify(data.name as string)
        }

        // Insert new product (without images)
        const supabase = await createClient()
        const { data: inserted, error: insertError } = await supabase
            .from('product')
            .insert({
                ...data,
                img: [],
            })
            .select()
            .single()

        if (insertError) {
            return {
                errors: {
                    general: `Failed to add product: ${insertError.message}`,
                },
            }
        }

        // Handle images
        const existingImg = formData.getAll('existingImg[]').filter(Boolean) as string[]
        const files = formData
            .getAll('img')
            .filter((f) => typeof File !== 'undefined' && f instanceof File) as File[]

        if (files.length > 0 || existingImg.length > 0) {
            let imgUrls: string[] = existingImg

            if (files.length > 0) {
                imgUrls = await uploadImages(user.username, inserted.slug, '', files)
                if (existingImg.length > 0) {
                    imgUrls = [...existingImg, ...imgUrls]
                }
            }

            await supabase.from('product').update({ img: imgUrls }).eq('id', inserted.id)
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { errors: {} as Record<string, string> }
    } catch (error) {
        return {
            errors: {
                general: error instanceof Error ? error.message : 'Unknown error occurred',
            },
        }
    }
}

// Update an existing product
export async function updateProduct(
    prevState: { errors: Record<string, string> },
    formData: FormData
) {
    try {
        const user = await userSession()
        const id = parseInt(formData.get('id') as string)

        // Extract form data
        const data = extractFormData(formData, ['id'])

        // Validate form data with Zod
        const formDataResult = ProductFormSchema.safeParse(data)

        if (!formDataResult.success) {
            const errors: Record<string, string> = {}

            formDataResult.error.issues.forEach((issue) => {
                if (issue.path && issue.path[0]) {
                    errors[issue.path[0] as string] = issue.message
                }
            })

            return { errors }
        }

        // Get existing product with current images
        const supabase = await createClient()
        const { data: currentProduct, error: fetchError } = await supabase
            .from('product')
            .select('img, slug')
            .eq('id', id)
            .single()

        if (fetchError) {
            return { errors: { general: fetchError.message || 'Fetch error' } }
        }

        // Handle images
        const existingImg = formData.getAll('existingImg[]') as string[]
        const newImages = formData.getAll('img') as File[]

        const imgUrls = await handleImageUpdates(
            user.username,
            currentProduct.slug,
            '', // No subpath for product images
            existingImg,
            currentProduct.img || [],
            newImages
        )

        // Update product
        const { error } = await supabase
            .from('product')
            .update({
                ...data,
                img: imgUrls,
            })
            .eq('id', id)

        if (error) {
            return { errors: { general: error.message || 'Update error' } }
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { errors: {} as Record<string, string> }
    } catch (error) {
        return {
            errors: { general: error instanceof Error ? error.message : 'Unknown error occurred' },
        }
    }
}

// Soft delete a product (leveraging Supabase function)
export async function softDeleteProduct(
    prevState: { errors: Record<string, string> },
    formData: FormData
): Promise<{ errors: Record<string, string> }> {
    try {
        // Get current authenticated user
        const user = await userSession()

        // Extract product ID from form data
        const id = parseInt(formData.get('id') as string)

        // Basic validation
        if (!id || isNaN(id)) {
            return {
                errors: {
                    general: 'Product ID is required',
                },
            }
        }

        try {
            // Validate product ownership
            await validateProductOwnership(id, user.id)
        } catch (error) {
            return {
                errors: {
                    general: error instanceof Error ? error.message : 'Product validation failed',
                },
            }
        }

        const supabase = await createClient()

        // Soft delete using the Supabase function (this will cascade to variants)
        const { error } = await supabase.rpc('soft_delete_product', { pid: id })

        if (error) {
            return {
                errors: {
                    general: `Failed to delete product: ${error.message}`,
                },
            }
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { errors: {} as Record<string, string> }
    } catch (error) {
        return {
            errors: {
                general: error instanceof Error ? error.message : 'Unknown error occurred',
            },
        }
    }
}

// Permanently delete a product
export async function permanentlyDeleteProduct(productId: number) {
    try {
        // Get current authenticated user
        const user = await userSession()

        // Validate product ownership
        const supabase = await createClient()
        const { data: product, error } = await supabase
            .from('product')
            .select('user_id, img, slug')
            .eq('id', productId)
            .single()

        if (error || !product) {
            throw new Error('Product not found')
        }

        if (product.user_id !== user.id) {
            throw new Error('Unauthorized: You can only delete your own products')
        }

        // Delete all product images from storage
        if (user.username && product.slug) {
            // Delete base product images
            const folderPath = `@${user.username}/products/${product.slug}`
            const { data: files, error: listError } = await supabase.storage
                .from('user')
                .list(folderPath, { limit: 1000 })

            if (!listError && files && files.length > 0) {
                // Delete all files in the product folder (including variant subfolders)
                const paths = files.map((file) => `${folderPath}/${file.name}`)

                await supabase.storage.from('user').remove(paths)
            }
        }

        // Note: We don't call cleanup_deleted_products here as that's a scheduled function
        // The actual database cleanup will happen via the cron job

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

// Restore a product from trash (leveraging Supabase function)
export async function restoreProduct(productId: number) {
    try {
        // Get current authenticated user
        const user = await userSession()

        // Validate product ownership
        const supabase = await createClient()
        const { data: product, error } = await supabase
            .from('product')
            .select('user_id')
            .eq('id', productId)
            .single()

        if (error || !product) {
            throw new Error('Product not found')
        }

        if (product.user_id !== user.id) {
            throw new Error('Unauthorized: You can only restore your own products')
        }

        // Restore product using the Supabase function (this will cascade to variants)
        const { error: restoreError } = await supabase.rpc('restore_product', { pid: productId })

        if (restoreError) {
            throw new Error(`Failed to restore product: ${restoreError.message}`)
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

// Set product quantity
export async function setProductQty(id: number, newQty: number) {
    try {
        const user = await userSession()

        await validateProductOwnership(id, user.id)

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product')
            .update({ qty: newQty })
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            throw new Error(`Failed to update quantity: ${error.message}`)
        }

        revalidatePath('/[user]/[slug]', 'page')
        revalidatePath('/[user]', 'page')

        return { success: true, qty: data.qty, product: data }
    } catch (error) {
        logWarning('Error updating product quantity:', error)
        throw new Error(
            error instanceof Error ? error.message : 'Failed to update product quantity'
        )
    }
}

// Add a new product variant
export async function addVariant(
    prevState: { errors: Record<string, string> },
    formData: FormData
) {
    try {
        const user = await userSession()
        const productId = parseInt(formData.get('product_id') as string)

        if (!productId || isNaN(productId)) {
            return {
                errors: {
                    general: 'Product ID is required',
                },
            }
        }

        // Validate product ownership
        await validateProductOwnership(productId, user.id)

        // Extract variant data
        const data = extractFormData(formData, ['product_id'])

        // Validate form data with Zod
        const formDataResult = VariantFormSchema.safeParse(data)

        if (!formDataResult.success) {
            const errors: Record<string, string> = {}

            formDataResult.error.issues.forEach((issue) => {
                if (issue.path && issue.path[0]) {
                    errors[issue.path[0] as string] = issue.message
                }
            })

            return { errors }
        }

        data.product_id = productId

        // Insert new variant
        const supabase = await createClient()
        const { data: inserted, error: insertError } = await supabase
            .from('product_variants')
            .insert(data)
            .select()
            .single()

        if (insertError) {
            return {
                errors: {
                    general: `Failed to add variant: ${insertError.message}`,
                },
            }
        }

        // Handle images if any
        const files = formData
            .getAll('img')
            .filter((f) => typeof File !== 'undefined' && f instanceof File) as File[]

        if (files.length > 0) {
            try {
                // Get the product slug for image path
                const { data: product, error: productError } = await supabase
                    .from('product')
                    .select('slug')
                    .eq('id', productId)
                    .single()

                if (productError) throw productError

                const imgUrls = await uploadImages(user.username, product.slug, inserted.id, files)

                // Update variant with image URLs
                await supabase
                    .from('product_variants')
                    .update({ img: imgUrls })
                    .eq('id', inserted.id)
            } catch (error) {
                logWarning('Error uploading variant images:', error)
                // Don't fail the entire operation if image upload fails
            }
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { errors: {} as Record<string, string> }
    } catch (error) {
        return {
            errors: {
                general: error instanceof Error ? error.message : 'Unknown error occurred',
            },
        }
    }
}

// Update an existing product variant
export async function updateVariant(
    prevState: { errors: Record<string, string> },
    formData: FormData
) {
    try {
        const user = await userSession()
        const id = parseInt(formData.get('id') as string)
        const productId = parseInt(formData.get('product_id') as string)

        if (!id || isNaN(id)) {
            return {
                errors: {
                    general: 'Variant ID is required',
                },
            }
        }

        if (!productId || isNaN(productId)) {
            return {
                errors: {
                    general: 'Product ID is required',
                },
            }
        }

        // Validate product ownership
        await validateProductOwnership(productId, user.id)

        // Extract variant data
        const data = extractFormData(formData, ['id', 'product_id'])

        // Validate form data with Zod
        const formDataResult = VariantFormSchema.safeParse(data)

        if (!formDataResult.success) {
            const errors: Record<string, string> = {}

            formDataResult.error.issues.forEach((issue) => {
                if (issue.path && issue.path[0]) {
                    errors[issue.path[0] as string] = issue.message
                }
            })

            return { errors }
        }

        // Get existing variant with current images
        const supabase = await createClient()
        const { data: currentVariant, error: fetchError } = await supabase
            .from('product_variants')
            .select('img')
            .eq('id', id)
            .single()

        if (fetchError) {
            return { errors: { general: fetchError.message || 'Fetch error' } }
        }

        // Handle images
        const existingImg = formData.getAll('existingImg[]') as string[]
        const newImages = formData.getAll('img') as File[]

        // Get the product slug for image path
        const { data: product, error: productError } = await supabase
            .from('product')
            .select('slug')
            .eq('id', productId)
            .single()

        if (productError) throw productError

        const imgUrls = await handleImageUpdates(
            user.username,
            product.slug,
            id, // Variant ID as subpath
            existingImg,
            currentVariant.img || [],
            newImages
        )

        // Update variant
        const { error } = await supabase
            .from('product_variants')
            .update({
                ...data,
                img: imgUrls,
            })
            .eq('id', id)

        if (error) {
            return { errors: { general: error.message || 'Update error' } }
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { errors: {} as Record<string, string> }
    } catch (error) {
        return {
            errors: { general: error instanceof Error ? error.message : 'Unknown error occurred' },
        }
    }
}

// Delete a product variant
export async function deleteVariant(variantId: number) {
    try {
        const user = await userSession()

        // First, get the variant to check ownership
        const supabase = await createClient()
        const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .select('product_id')
            .eq('id', variantId)
            .single()

        if (variantError || !variant) {
            throw new Error('Variant not found')
        }

        // Validate product ownership
        await validateProductOwnership(variant.product_id, user.id)

        // Delete the variant (RLS will handle access control)
        const { error } = await supabase.from('product_variants').delete().eq('id', variantId)

        if (error) {
            throw new Error(`Failed to delete variant: ${error.message}`)
        }

        // Revalidate the page to refresh data
        revalidatePath('/[user]/[slug]', 'page')

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

type ActionState = { errors: Record<string, string> }

export async function dispatchProductAction(
    prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const intent = (formData.get('_intent') as string) || ''

    switch (intent) {
        case 'product:add':
            return addProduct(prev, formData)
        case 'product:update':
            return updateProduct(prev, formData)
        case 'variant:add':
            return addVariant(prev, formData)
        case 'variant:update':
            return updateVariant(prev, formData)
        default:
            return { errors: { general: 'Unknown action' } }
    }
}

// Type definitions for return values
type ProductsResult =
    | {
          success: true
          products: Product[]
          canManage: boolean
      }
    | {
          success: false
          products: []
          canManage: boolean
          error: string
      }

type ProductResult =
    | {
          success: true
          product: Product & { variants: ProductVariant[] }
      }
    | {
          success: false
          product: null
          error: string
      }

type SimpleProductsResult = {
    products: Product[]
    canManage: boolean
}

// Get products for a user (simplified version that matches the requested pattern)
export async function getProducts(username: string): Promise<SimpleProductsResult> {
    const result = await getProductsByUsername(username)

    if (result.success) {
        return {
            products: result.products,
            canManage: result.canManage,
        }
    } else {
        return {
            products: [],
            canManage: false,
        }
    }
}

// Get products by username
export async function getProductsByUsername(username: string): Promise<ProductsResult> {
    try {
        const supabase = await createClient()

        // Get current authenticated user (if any)
        let currentUser = null

        try {
            currentUser = await userSession()
        } catch {
            // User not authenticated - can only view, not manage
        }

        let products: Product[] = []
        let canManage = false

        // Get target user by username
        const { data: targetUser, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .eq('username', username)
            .single()

        if (userError || !targetUser) {
            throw new Error('User not found')
        }

        // Check if current user can manage this profile
        canManage = currentUser?.username === targetUser.username

        // Build query for products
        const query = supabase
            .from('product')
            .select('*')
            .eq('user_id', targetUser.id)
            .order('created_at', { ascending: false })
            .is('deleted_at', null) // Only active products

        const { data: productsData, error } = await query

        if (error) {
            throw new Error(`Failed to fetch products: ${error.message}`)
        }

        // Parse products with Zod schema
        products = productsData.map((product) => {
            const result = ProductSchema.safeParse(product)

            if (!result.success) {
                logWarning('Product validation failed:', result.error)
            }

            return result.success ? result.data : (product as Product)
        })

        return {
            success: true,
            products,
            canManage,
        }
    } catch (error) {
        return {
            success: false,
            products: [],
            canManage: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

export async function getProduct(productId: number): Promise<ProductResult> {
    try {
        const supabase = await createClient()

        // Get the product
        const { data: product, error } = await supabase
            .from('product')
            .select('*')
            .eq('id', productId)
            .single()

        if (error) {
            throw new Error(`Failed to fetch product: ${error.message}`)
        }

        if (!product) {
            throw new Error('Product not found')
        }

        // Get variants for this product
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .is('deleted_at', null)

        if (variantsError) {
            throw new Error(`Failed to fetch product variants: ${variantsError.message}`)
        }

        // Add variants to the product
        const productWithVariants = {
            ...product,
            variants: variants || [],
        }

        // Validate with Zod schema
        const productResult = ProductSchema.safeParse(product)

        if (!productResult.success) {
            logWarning('Product validation failed:', productResult.error)
        }

        const validatedVariants =
            variants?.map((variant) => {
                const result = ProductVariantSchema.safeParse(variant)

                if (!result.success) {
                    logWarning('Variant validation failed:', result.error)
                }

                return result.success ? result.data : (variant as ProductVariant)
            }) || []

        const parsedProduct = {
            ...(productResult.success ? productResult.data : (product as Product)),
            variants: validatedVariants,
        }

        return {
            success: true,
            product: parsedProduct,
        }
    } catch (error) {
        return {
            success: false,
            product: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}

export async function getProductBySlug(slug: string): Promise<ProductResult> {
    try {
        const supabase = await createClient()

        // Get the product
        const { data: product, error } = await supabase
            .from('product')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) {
            throw new Error(`Failed to fetch product: ${error.message}`)
        }

        if (!product) {
            throw new Error('Product not found')
        }

        // Get variants for this product
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id)
            .is('deleted_at', null)

        if (variantsError) {
            throw new Error(`Failed to fetch product variants: ${variantsError.message}`)
        }

        // Add variants to the product
        const productWithVariants = {
            ...product,
            variants: variants || [],
        }

        // Validate with Zod schema
        const productResult = ProductSchema.safeParse(product)

        if (!productResult.success) {
            logWarning('Product validation failed:', productResult.error)
        }

        const validatedVariants =
            variants?.map((variant) => {
                const result = ProductVariantSchema.safeParse(variant)

                if (!result.success) {
                    logWarning('Variant validation failed:', result.error)
                }

                return result.success ? result.data : (variant as ProductVariant)
            }) || []

        const parsedProduct = {
            ...(productResult.success ? productResult.data : (product as Product)),
            variants: validatedVariants,
        }

        return {
            success: true,
            product: parsedProduct,
        }
    } catch (error) {
        return {
            success: false,
            product: null,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}
