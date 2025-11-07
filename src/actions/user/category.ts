'use server'

import { createClient } from '@/supabase/server'
import sharp from 'sharp'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Categories, Category, CategoryInput } from '@/types/category'
import { R2 } from '@/supabase/r2'

async function uploadImageFromUrl(url: string, name: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch image from URL')

  const arrayBuffer = await response.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)
  const pngBuffer = await sharp(inputBuffer).png().toBuffer()

  const safeName = name.trim().toLowerCase().replace(/\s+/g, '-')
  const storagePath = `assets/categories/${safeName}.png`

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storagePath,
      Body: pngBuffer,
      ContentType: 'image/png',
    })
  )

  return `/${storagePath}`
}

export async function createCategory(input: CategoryInput) {
  const supabase = await createClient()
  let imagePath = ''

  if (input.imageUrl) {
    imagePath = await uploadImageFromUrl(input.imageUrl, input.name)
  }

  const { data, error } = await supabase.rpc('create_category', {
    p_name: input.name,
    p_keywords: input.keywords,
    p_description: input.description,
    p_image: imagePath,
  })

  if (error) throw error
  return data as Category
}

export async function updateCategory(input: Category & { imageUrl?: string }) {
  const supabase = await createClient()
  let imagePath = input.image

  if (input.imageUrl && input.imageUrl.startsWith('http')) {
    if (input.image) {
      const oldPath = input.image.replace(/^\//, '') 
      await R2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: oldPath,
        })
      )
    }

    imagePath = await uploadImageFromUrl(input.imageUrl, input.name)
  }

  const { data, error } = await supabase.rpc('update_category', {
    p_id: input.id,
    p_name: input.name,
    p_keywords: input.keywords,
    p_description: input.description,
    p_image: imagePath,
  })

  if (error) throw error
  return data as Category
}

export async function deleteCategory(categoryId: string, imagePath?: string) {
  const supabase = await createClient()

  if (imagePath) {
    const storagePath = imagePath.replace(/^\//, '')
    await R2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storagePath,
      })
    )
  }

  const { error } = await supabase.rpc('delete_category', { p_id: categoryId })
  if (error) throw error

  return true
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_categories')

  return {
    categories: (data ?? []) as Categories,
    empty: !data || data.length === 0,
    error,
  }
}
