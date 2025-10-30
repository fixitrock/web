'use server'
import { createClient } from '@/supabase/server'
import sharp from 'sharp'
import {
    Category as Brand,
    Categories as Brands,
    CategoryInput as BrandInput,
} from '@/types/category'

async function uploadImageFromUrl(url: string, name: string) {
    const supabase = await createClient()

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image from URL')

    const arrayBuffer = await response.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    const pngBuffer = await sharp(inputBuffer).png().toBuffer()

    const safeName = name.trim().toLowerCase().replace(/\s+/g, '-')
    const storagePath = `brands/${safeName}.png`

    const { error } = await supabase.storage.from('assets').upload(storagePath, pngBuffer, {
        contentType: 'image/png',
        upsert: true,
    })
    if (error) throw error

    return `/assets/${storagePath}`
}

export async function createBrand(input: BrandInput) {
    const supabase = await createClient()
    let imagePath = ''

    if (input.imageUrl) {
        imagePath = await uploadImageFromUrl(input.imageUrl, input.name)
    }

    const { data, error } = await supabase.rpc('create_brand', {
        p_name: input.name,
        p_keywords: input.keywords,
        p_description: input.description,
        p_image: imagePath,
    })

    if (error) throw error
    return data as Brand
}

export async function updateBrand(input: Brand & { imageUrl?: string }) {
    const supabase = await createClient()
    let imagePath = input.image

    if (input.imageUrl && input.imageUrl.startsWith('http')) {
        if (input.image) {
            const oldPath = input.image.replace('/assets/', '')
            await supabase.storage.from('assets').remove([oldPath])
        }

        imagePath = await uploadImageFromUrl(input.imageUrl, input.name)
    }

    const { data, error } = await supabase.rpc('update_brand', {
        p_id: input.id,
        p_name: input.name,
        p_keywords: input.keywords,
        p_description: input.description,
        p_image: imagePath,
    })

    if (error) throw error
    return data as Brand
}

export async function deleteBrand(brandId: string, imagePath?: string) {
    const supabase = await createClient()

    if (imagePath) {
        const storagePath = imagePath.replace('/assets/', '')
        const { error: deleteError } = await supabase.storage.from('assets').remove([storagePath])
        if (deleteError) throw deleteError
    }

    const { error } = await supabase.rpc('delete_brand', { p_id: brandId })
    if (error) throw error

    return true
}

export async function getBrands() {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_brands')

    return {
        brands: (data ?? []) as Brands,
        empty: !data || data.length === 0,
        error,
    }
}
