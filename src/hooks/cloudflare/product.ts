'use client'

import { generateUploadUrls } from '@/actions/user/upload'
import type { Product } from '@/types/product'
import { uploadFilesDirectly } from './upload'

export async function prepareProduct(product: Product): Promise<Product> {
  const allNewFiles: { variantIdx: number; file: File }[] = []

  product.variants.forEach((variant, idx) => {
    const newFiles = variant.image?.filter((i): i is File => i instanceof File) ?? []
    newFiles.forEach((file) => allNewFiles.push({ variantIdx: idx, file }))
  })

  if (allNewFiles.length === 0) return product
  const slug = `${product.name}/${product.category}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

  const files = allNewFiles.map((f) => f.file)
  const uploadUrls = await generateUploadUrls(slug, files)

  await uploadFilesDirectly(
    uploadUrls.map((u, idx) => ({
      signedUrl: u.signedUrl,
      file: files[idx],
    }))
  )

  const updatedVariants = product.variants.map((variant, idx) => {
    const existingUrls = variant.image?.filter((i): i is string => typeof i === 'string') ?? []
    const uploadedPaths = uploadUrls
      .filter((_, fIdx) => allNewFiles[fIdx]?.variantIdx === idx)
      .map((u) => u.path)
    return { ...variant, image: [...existingUrls, ...uploadedPaths] }
  })

  return { ...product, variants: updatedVariants }
}
