'use server'

import { withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import type { Product, Products } from '@/types/product'

export const createSignedUploadUrls = withErrorHandling(
  async (slug: string, files: { name: string; type: string }[]) => {
    const supabase = await createClient()
    const { data: userDetails, error: userError } = await supabase.rpc('get_current_user_details')
    if (userError || !userDetails) throw new Error('Failed to fetch user details')

    const username = userDetails.username
    const uploads = []

    for (const file of files) {
      const timestamp = Date.now()
      const path = `@${username}/products/${slug}/${timestamp}`

      const { data, error } = await supabase.storage
        .from('user')
        .createSignedUploadUrl(path)

      if (error || !data?.signedUrl)
        throw error || new Error('Failed to create signed upload URL')

      uploads.push({
        signedUrl: data.signedUrl,
        path: `/user/${path}`,
        type: file.type,
      })
    }

    return uploads
  }
)
async function deleteImagesFromStorage(paths: string[]) {
  if (!Array.isArray(paths) || paths.length === 0) return

  const supabase = await createClient()

  const cleanedPaths = paths
    .map((url) => url.replace(/^\/?user\//, '').trim())
    .filter(Boolean)

  if (cleanedPaths.length === 0) return

  const { error } = await supabase.storage.from('user').remove(cleanedPaths)
  if (error) {
    console.error('❌ Failed to delete some images:', error.message)
  } else {
    console.info('🧹 Deleted images from storage:', cleanedPaths)
  }
}

export async function prepareProduct(product: Product) {
  const slug = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.category.toLowerCase().replace(/\s+/g, '-')}`

  const updatedVariants = await Promise.all(
    product.variants.map(async (variant) => {
      const existingUrls = variant.image?.filter((i): i is string => typeof i === 'string') ?? []
      const newFiles = variant.image?.filter((i): i is File => i instanceof File) ?? []

      if (newFiles.length === 0) return { ...variant, image: existingUrls }

      const signed = await createSignedUploadUrls(slug, newFiles.map(f => ({ name: f.name, type: f.type })))
      await Promise.all(
        signed.map(async (u, i) => {
          const res = await fetch(u.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': u.type },
            body: newFiles[i],
          })
          if (!res.ok) throw new Error(`Upload failed: ${newFiles[i].name}`)
        })
      )

      const uploadedPaths = signed.map(u => u.path)
      return { ...variant, image: [...existingUrls, ...uploadedPaths] }
    })
  )

  return { ...product, variants: updatedVariants }
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

  if (removed.length > 0) {
    await deleteImagesFromStorage(removed)
  }

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


