'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { CustomerInput, CustomerSchema } from '@/types'

async function userID() {
    const supabase = await createClient()
    const { data: claims } = await supabase.auth.getClaims()
    const id = claims?.claims?.sub

    return id ?? null
}

export async function searchCustomer(query: string) {
    if (!query) return []

    const supabase = await createClient()
    const clean = query.replace(/\D/g, '')

    if (!clean) return []
    const phone = clean.startsWith('91') ? clean : `91${clean}`

    const { data, error } = await supabase
        .from('users')
        .select('id, phone, name, address, avatar, gender')
        .eq('phone', phone)
        .maybeSingle()

    if (error || !data) return []

    return [data]
}

export async function addCustomer(customer: CustomerInput) {
    const validated = CustomerSchema.parse(customer)
    const formattedPhone = validated.phone.startsWith('91')
        ? validated.phone
        : `91${validated.phone}`

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .insert([{ ...validated, phone: formattedPhone, active: false }])
        .select()

    if (error) throw error

    return data?.[0] ?? null
}

// export async function userProducts(
//     category?: string
// ): Promise<{ products: Products; error: string | null; empty: boolean }> {
//     const supabase = await createClient()
//     const id = await userID()

//     if (!id) {
//         return { products: [], error: 'User not found', empty: true }
//     }

//     let query = supabase
//         .from('product')
//         .select(`*, product_variants(*)`)
//         .eq('seller_id', id)
//         .order('id', { ascending: false })
//         .limit(40)

//     if (category && category !== 'all') {
//         query = query.eq('category', category)
//     }

//     const { data, error } = await query

//     return {
//         products: (data ?? []) as Products,
//         error: error?.message ?? null,
//         empty: !data || data.length === 0,
//     }
// }

// export async function searchUserProducts(
//     search: string,
//     category?: string
// ): Promise<{ products: Products; error: string | null; empty: boolean }> {
//     const supabase = await createClient()
//     const id = await userID()

//     const trimmed = search.trim()

//     if (trimmed.length === 0) return userProducts(category)

//     if (!id) {
//         return { products: [], error: 'User not found', empty: true }
//     }

//     let queryBuilder = supabase
//         .from('product')
//         .select(`*, product_variants(*)`)
//         .eq('seller_id', id)
//         .order('id', { ascending: false })
//         .limit(40)

//     if (category && category !== 'all') {
//         queryBuilder = queryBuilder.eq('category', category)
//     }

//     const tsQuery = trimmed
//         .split(/\s+/)
//         .map((word) => word.replace(/'/g, "''"))
//         .join(' & ')

//     queryBuilder = queryBuilder.textSearch('query', tsQuery, {
//         config: 'simple',
//         type: 'plain',
//     })

//     const { data, error } = await queryBuilder

//     return {
//         products: (data ?? []) as Products,
//         error: error?.message ?? null,
//         empty: !data || data.length === 0,
//     }
// }

export const sellerCategories = cache(
    async (): Promise<{ categories: string[]; error: string | null; empty: boolean }> => {
        const supabase = await createClient()
        const id = await userID()

        if (!id) {
            return { categories: [], error: 'User not found', empty: true }
        }

        const { data, error } = await supabase
            .from('product_categories')
            .select('category')
            .eq('seller_id', id)
            .order('category', { ascending: true })

        const categories = data?.map((c) => c.category) ?? []

        return {
            categories,
            error: error ? error.message : null,
            empty: categories.length === 0,
        }
    }
)
