'use server'

import { uploadFilesDirectly, withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Product, Products } from '@/types/product'
import { R2 } from '@/supabase/r2'


async function generateSignedUrlsForAll(
  username: string,
  productSlug: string,
  files: { variantIdx: number; file: File }[]
) {
  const baseTs = Date.now()

  const uploads = await Promise.all(
    files.map(async ({ variantIdx, file }, idx) => {
      const timestamp = baseTs + idx
      const key = `@${username}/products/${productSlug}/${timestamp}.png`

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: file.type,
      })

      const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 })

      return {
        signedUrl,
        path: `/${key}`,
        variantIdx,
        file,
      }
    })
  )

  return uploads
}

export const deleteImagesFromR2 = async (paths: string[]): Promise<void> => {
  if (!Array.isArray(paths) || paths.length === 0) return

  const cleanedPaths = paths
    .map((p) => p.replace(/^\/?/, '').trim())
    .filter(Boolean)

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


export const prepareProduct = async (product: Product): Promise<Product> => {
  const supabase = await createClient()
  const { data: userDetails, error: userError } =
    await supabase.rpc('get_current_user_details')
  if (userError || !userDetails) throw new Error('Failed to fetch user details')
  const username = userDetails.username

  const slug = `${product.name.toLowerCase().replace(/\s+/g, '-')}-${product.category
    .toLowerCase()
    .replace(/\s+/g, '-')}`
  const allNewFiles: { variantIdx: number; file: File }[] = []
  product.variants.forEach((variant, idx) => {
    const newFiles = variant.image?.filter((i): i is File => i instanceof File) ?? []
    newFiles.forEach((file) => allNewFiles.push({ variantIdx: idx, file }))
  })

  
  const uploads = await generateSignedUrlsForAll(username, slug, allNewFiles)

  
  await uploadFilesDirectly(uploads.map(u => ({ signedUrl: u.signedUrl, file: u.file })))


  const updatedVariants = product.variants.map((variant, idx) => {
    const existingUrls = variant.image?.filter((i): i is string => typeof i === 'string') ?? []
    const uploadedPaths = uploads
      .filter(u => u.variantIdx === idx)
      .map(u => u.path)

    return { ...variant, image: [...existingUrls, ...uploadedPaths] }
  })

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
