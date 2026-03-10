'use client'

import { generateUploadUrls } from '@/actions/user/upload'
import type { Product } from '@/types/product'
import { uploadFilesDirectly } from './upload'

export async function prepareProduct(product: Product): Promise<Product> {
    const allNewFiles: { variantIdx: number | 'thumbnail'; file: File }[] = []

    if (product.thumbnail instanceof File) {
        allNewFiles.push({ variantIdx: 'thumbnail', file: product.thumbnail })
    }

    product.variants.forEach((variant, idx) => {
        const newFiles = variant.image?.filter((i): i is File => i instanceof File) ?? []
        newFiles.forEach((file) => allNewFiles.push({ variantIdx: idx, file }))
    })

    if (allNewFiles.length === 0) return product
    const slug = `${product.name}/${product.category}`.trim().toLowerCase().replace(/\s+/g, '-')

    const files = allNewFiles.map((f) => f.file)
    const uploadUrls = await generateUploadUrls(slug, files)
    const uploads = uploadUrls.map((u, idx) => {
        const file = files[idx]

        if (!file) {
            throw new Error('Upload file list is out of sync with generated upload URLs.')
        }

        return {
            signedUrl: u.signedUrl,
            file,
        }
    })

    await uploadFilesDirectly(uploads)

    let updatedThumbnail = product.thumbnail as string | undefined
    const thumbnailUpload = uploadUrls.find((_, i) => allNewFiles[i]?.variantIdx === 'thumbnail')
    if (thumbnailUpload) {
        updatedThumbnail = thumbnailUpload.path
    }

    const updatedVariants = product.variants.map((variant, idx) => {
        const existingUrls = variant.image?.filter((i): i is string => typeof i === 'string') ?? []
        const uploadedPaths = uploadUrls
            .filter((_, fIdx) => allNewFiles[fIdx]?.variantIdx === idx)
            .map((u) => u.path)
        return { ...variant, image: [...existingUrls, ...uploadedPaths] }
    })

    return { ...product, thumbnail: updatedThumbnail, variants: updatedVariants }
}
