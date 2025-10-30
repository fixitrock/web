'use server'

import { withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import type { Product, Products } from '@/types/product'

export const addProduct = withErrorHandling(async (data: Product) => {
  const supabase = await createClient()

  const { data: userDetails, error: userError } = await supabase.rpc('get_current_user_details')
  if (userError || !userDetails) throw new Error('Failed to fetch user details')

  const username = userDetails.username
  const slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${data.category
    .toLowerCase()
    .replace(/\s+/g, '-')}`

  const variantsWithUploads = await Promise.all(
    data.variants.map(async (variant) => {
      const uploadedPaths: string[] = []


      if (variant.files?.length) {
        for (const file of variant.files.slice(0, 3)) {
          const ext = file.name.split('.').pop() || 'png'
          const filename = `${Date.now()}.${ext}`
          const path = `@${username}/products/${slug}/${filename}`

          const { error: uploadError } = await supabase.storage
            .from('user')
            .upload(path, file, { upsert: false })

          if (uploadError) throw uploadError
          uploadedPaths.push(`/user/${path}`)
        }
      }

      return {
        ...variant,
        image: [...(variant.image ?? []), ...uploadedPaths],
      }
    })
  )

  const { data: product_id, error } = await supabase.rpc('addproduct', {
    payload: {
      ...data,
      variants: variantsWithUploads.map((v) => ({
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
  const { data: userDetails, error: userError } = await supabase.rpc('get_current_user_details')
  if (userError || !userDetails) throw new Error('Failed to fetch user details')

  const username = userDetails.username
  const slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${data.category
    .toLowerCase()
    .replace(/\s+/g, '-')}`

  const variantsWithUploads = await Promise.all(
    data.variants.map(async (variant) => {
      const uploadedPaths: string[] = []

      if (variant.files?.length) {
        for (const file of variant.files.slice(0, 3)) {
          const ext = file.name.split('.').pop() || 'png'
          const filename = `${Date.now()}.${ext}`
          const path = `@${username}/products/${slug}/${filename}`

          const { error: uploadError } = await supabase.storage
            .from('user')
            .upload(path, file, { upsert: false })

          if (uploadError) throw uploadError
          uploadedPaths.push(`/user/${path}`)
        }
      }

      return {
        ...variant,
        image: [...(variant.image ?? []), ...uploadedPaths],
      }
    })
  )

  const { data: product_id, error } = await supabase.rpc('updateproduct', {
    payload: {
      ...data,
      variants: variantsWithUploads.map((v) => ({
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


export async function sellerProducts  (search: string, category?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('posproduct', { search, category })


    return {
      products: (data?.products ?? []) as Products,
      error,
      empty: data?.empty ?? true,
    }
  } 


