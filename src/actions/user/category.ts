'use server'
import { createClient } from '@/supabase/server'
import { Categories, Category, CategoryInput } from '@/types/category'

async function uploadImageFromUrl(url: string, name: string) {
    const supabase = await createClient()

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image from URL')

    const blob = await response.blob()
    const extension = blob.type.split('/')[1] || 'png'
    const safeName = name.trim().toLowerCase().replace(/\s+/g, '-')
    const storagePath = `categories/${safeName}.${extension}`

    const file = new File([blob], storagePath, { type: blob.type })
    const { error } = await supabase.storage
        .from('assets')
        .upload(storagePath, file, { upsert: true })
    if (error) throw error

    return `/assets/${storagePath}`
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
            const oldPath = input.image.replace('/assets/', '')
            await supabase.storage.from('assets').remove([oldPath])
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
        const storagePath = imagePath.replace('/assets/', '')
        const { error: deleteError } = await supabase.storage.from('assets').remove([storagePath])
        if (deleteError) throw deleteError
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
