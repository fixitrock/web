'use server'

import { withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import type { Product, Products } from '@/types/product'

async function createSignedUrlForPath(path: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('user')
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl)
    throw error || new Error('Failed to create signed upload URL')

  return data.signedUrl
}

export const uploadVariantImagesSigned = withErrorHandling(
  async (slug: string, files: File[]) => {
    const supabase = await createClient()

    const { data: userDetails, error: userError } = await supabase.rpc(
      'get_current_user_details'
    )
    if (userError || !userDetails)
      throw new Error('Failed to fetch user details')

    const username = userDetails.username
    const uploaded: string[] = []

    for (const file of files.slice(0, 3)) {
      const ext = file.name.split('.').pop() || 'png'
      const filename = `${Date.now()}.${ext}`
      const path = `@${username}/products/${slug}/${filename}`

      const signedUrl = await createSignedUrlForPath(path)

      const res = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!res.ok) throw new Error(`Failed to upload ${file.name}`)

      uploaded.push(`/user/${path}`)
    }

    return uploaded
  }
)

async function deleteImagesFromStorage(paths: string[]) {
  if (!paths?.length) return

  const supabase = await createClient()

  const cleanedPaths = paths.map((url) => url.replace(/^\/?user\//, ''))

  const { error } = await supabase.storage.from('user').remove(cleanedPaths)
  if (error) console.error('Failed to delete images:', error)
}

export const addProduct = withErrorHandling(async (data: Product) => {
  const supabase = await createClient()
  
  // Images are already uploaded in the client, so we just pass the data through
  const { data: product_id, error } = await supabase.rpc('addproduct', {
    payload: {
      ...data,
      variants: data.variants.map((v) => ({
        brand: v.brand,
        color: v.color,
        storage: v.storage,
        purchase_price: v.purchase_price,
        wholesale_price: v.wholesale_price,
        price: v.price,
        mrp: v.mrp,
        quantity: v.quantity,
        image: v.image,
      })),
    },
  })

  if (error) throw error
  return product_id
})

export const updateProduct = withErrorHandling(async (data: Product) => {
  const supabase = await createClient()
  
  // Images are already uploaded in the client, so we just pass the data through
  const { data: oldProducts } = await supabase.rpc('posproduct', {
    search: data.name,
    category: data.category,
  })

  const oldProduct = oldProducts?.products?.find(
    (p: any) => p.id === data.id
  )
  const oldVariants = oldProduct?.variants ?? []

  // Handle image cleanup for updated variants
  const variantsWithCleanup = data.variants.map((variant) => {
    const oldVariant = oldVariants.find((v: any) => v.id === variant.id)
    if (oldVariant?.image?.length) {
      const existingUrls = variant.image?.filter((item): item is string => typeof item === 'string') ?? []
      const removed = oldVariant.image.filter(
        (img: string) => !existingUrls.includes(img)
      )
      if (removed.length) {
        // Clean up removed images in background
        deleteImagesFromStorage(removed).catch(console.error)
      }
    }
    
    return variant
  })

  const { data: product_id, error } = await supabase.rpc('updateproduct', {
    payload: {
      ...data,
      variants: variantsWithCleanup.map((v) => ({
        id: v.id,
        brand: v.brand,
        color: v.color,
        storage: v.storage,
        purchase_price: v.purchase_price,
        wholesale_price: v.wholesale_price,
        price: v.price,
        mrp: v.mrp,
        quantity: v.quantity,
        image: v.image,
      })),
    },
  })

  if (error) throw error
  return product_id
})

export async function sellerProducts(search: string, category?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('posproduct', { search, category })

  return {
    products: (data?.products ?? []) as Products,
    error,
    empty: data?.empty ?? true,
  }
}
